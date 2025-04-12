import { auth } from "@/auth";
import { saveConversation } from "@/lib/actions/conversations";
import {
  OnFinishResult,
  saveResultAsAssistantMessage,
  saveUserMessage,
} from "@/lib/dao/messages";
import { decrementFreeMessages, getUserFromSession } from "@/lib/dao/users";
import rateLimit from "@/lib/rate-limiter";
import { AnthropicProviderOptions, anthropic } from "@ai-sdk/anthropic";
import { createAzure } from "@ai-sdk/azure";
import { fireworks } from "@ai-sdk/fireworks";
import { google } from "@ai-sdk/google";
import { perplexity } from "@ai-sdk/perplexity";
import { xai } from "@ai-sdk/xai";
import {
  extractReasoningMiddleware,
  smoothStream,
  streamText,
  wrapLanguageModel,
} from "ai";
import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";

const limiter = rateLimit(10, 60);

export const maxDuration = 30;

const azure = createAzure({
  apiVersion: "2024-12-01-preview",
});

const reasoningFireworks = (model: string) => {
  return wrapLanguageModel({
    model: fireworks(model),
    middleware: extractReasoningMiddleware({ tagName: "think" }),
  });
};

const allowedModels = {
  "4o-mini": azure("gpt-4o-mini"),
  "o3-mini": azure("o3-mini"),
  "claude-3-7-sonnet": anthropic("claude-3-7-sonnet-20250219"),
  "claude-3-7-sonnet-reasoning": anthropic("claude-3-7-sonnet-20250219"),
  "claude-3-5-sonnet": anthropic("claude-3-5-sonnet-20240620"),
  "claude-3-5-haiku": anthropic("claude-3-5-haiku-20241022"),
  "gemini-2.0-flash": google("gemini-2.0-flash", { useSearchGrounding: true }),
  "gemini-2.0-flash-lite": google("gemini-2.0-flash-lite"),
  "grok-3-beta": xai("grok-3-beta"),
  "grok-3-mini-beta": xai("grok-3-mini-beta"),
  "grok-2-1212": xai("grok-2-1212"),
  "llama-3.1-405b": fireworks("accounts/fireworks/models/llama-v3p1-405b-instruct"),
  "llama-4-scout": fireworks("accounts/fireworks/models/llama4-scout-instruct-basic"),
  "llama-4-maverick": fireworks(
    "accounts/fireworks/models/llama4-maverick-instruct-basic"
  ),
  "deepseek-r1": reasoningFireworks("accounts/fireworks/models/deepseek-r1"),
  "deepseek-v3": fireworks("accounts/fireworks/models/deepseek-v3"),
  sonar: perplexity("sonar"),
  "sonar-pro": perplexity("sonar-pro"),
};

function getProviderOptions(model: string) {
  const providerOptions: any = {};

  if (model === "deepseek-r1") {
    providerOptions.groq = { reasoningFormat: "parsed" };
  }

  if (model === "claude-3-7-sonnet-reasoning") {
    providerOptions.anthropic = {
      thinking: { type: "enabled", budgetTokens: 12000 },
    } satisfies AnthropicProviderOptions;
  }

  return providerOptions;
}

export async function POST(req: NextRequest) {
  const response = limiter(req);
  if (response) return response;

  const start = Date.now();
  const user = await getUserFromSession();
  const userFetched = Date.now();
  console.log(`User fetched in: ${userFetched - start}ms`);

  if (user.subscription === "free" && user.freeMessages <= 0) {
    return new Response("Out of free messages", { status: 400 });
  }

  const { id, messages, model: modelId, firstMessage } = await req.json();
  const model = allowedModels[modelId as keyof typeof allowedModels];

  if (!model) {
    return new Response("Invalid model", { status: 400 });
  }

  const result = streamText({
    model,
    messages,
    maxSteps: 5,
    providerOptions: getProviderOptions(modelId),
    experimental_transform: smoothStream({
      delayInMs: 10,
    }),
    onFinish: async (result: OnFinishResult) => {
      if (firstMessage) {
        // This is a new conversation, create it with both messages
        const conversation = {
          id,
          title: "New Chat",
          model: modelId,
          messages: [
            {
              ...messages[0],
              parts: undefined,
            },
            {
              id: uuidv4(),
              content: result.text,
              role: "assistant",
              reasoning: result.reasoning || null,
              signature: null,
            },
          ],
          lastMessageAt: new Date(),
        };

        await saveConversation(conversation);
      } else {
        // This is an existing conversation, just save the messages
        const lastMessage = messages[messages.length - 1];
        await saveUserMessage(lastMessage.content, id);
        await saveResultAsAssistantMessage(result, id);
      }
      if (user.subscription === "free") {
        await decrementFreeMessages(user.id);
      }
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const end = Date.now();
  console.log(`Response time: ${end - start}ms`);

  return result.toDataStreamResponse({ sendReasoning: true });
}
