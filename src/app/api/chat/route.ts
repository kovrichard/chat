import {
  OnFinishResult,
  saveResultAsAssistantMessage,
  saveUserMessage,
} from "@/lib/dao/messages";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { openai } from "@ai-sdk/openai";
import { smoothStream, streamText } from "ai";

export const maxDuration = 30;

const allowedModels = {
  "4o-mini": openai("gpt-4o-mini"),
  "o3-mini": openai("o3-mini"),
  "claude-3-7-sonnet": anthropic("claude-3-7-sonnet-20250219"),
  "claude-3-5-sonnet": anthropic("claude-3-5-sonnet-20240620"),
  "claude-3-5-haiku": anthropic("claude-3-5-haiku-20241022"),
  "gemini-2.0-flash": google("gemini-2.0-flash"),
  "gemini-2.0-flash-lite": google("gemini-2.0-flash-lite"),
  "llama-3.3": groq("llama-3.3-70b-versatile"),
  "deepseek-r1": groq("deepseek-r1-distill-llama-70b"),
};

function getProviderOptions(model: string) {
  if (model === "deepseek-r1") {
    return {
      groq: { reasoningFormat: "parsed" },
    };
  }

  return undefined;
}

export async function POST(req: Request) {
  const { messages, model: modelId, conversationId } = await req.json();
  const model = allowedModels[modelId as keyof typeof allowedModels];

  if (!model) {
    return new Response("Invalid model", { status: 400 });
  }

  const lastMessage = messages[messages.length - 1];
  await saveUserMessage(lastMessage.content, conversationId);

  const result = streamText({
    model,
    messages,
    maxSteps: 5,
    providerOptions: getProviderOptions(modelId),
    experimental_transform: smoothStream({
      delayInMs: 15,
    }),
    onFinish: async (result: OnFinishResult) => {
      await saveResultAsAssistantMessage(result, conversationId);
    },
  });

  return result.toDataStreamResponse({ sendReasoning: true });
}
