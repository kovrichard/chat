import { updateConversationTitle } from "@/lib/actions/conversations";
import { awsConfigured } from "@/lib/aws/s3";
import systemPrompt from "@/lib/backend/prompts/system-prompt";
import { appendMessageToConversation, getConversation } from "@/lib/dao/conversations";
import { saveMessage, uploadAttachments } from "@/lib/dao/messages";
import { decrementFreeMessages, getUserFromSession } from "@/lib/dao/users";
import { getModel } from "@/lib/providers";
import rateLimit from "@/lib/rate-limiter";
import { AnthropicProviderOptions, anthropic } from "@ai-sdk/anthropic";
import { createAzure } from "@ai-sdk/azure";
import { fireworks } from "@ai-sdk/fireworks";
import { google } from "@ai-sdk/google";
import { perplexity } from "@ai-sdk/perplexity";
import { xai } from "@ai-sdk/xai";
import {
  Attachment,
  Message,
  appendClientMessage,
  appendResponseMessages,
  extractReasoningMiddleware,
  smoothStream,
  streamText,
  wrapLanguageModel,
} from "ai";
import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";

const limiter = rateLimit(50, 60);

export const maxDuration = 55;

const azure = createAzure({
  apiVersion: "2024-12-01-preview",
});

const azure41 = createAzure({
  apiVersion: "2024-12-01-preview",
  apiKey: process.env.AZURE_GPT41_API_KEY,
  resourceName: process.env.AZURE_GPT41_RESOURCE_NAME,
});

const reasoningFireworks = (model: string) => {
  return wrapLanguageModel({
    model: fireworks(model),
    middleware: extractReasoningMiddleware({ tagName: "think" }),
  });
};

const allowedModels = {
  "o4-mini": azure41("o4-mini"),
  "gpt-4.1": azure41("gpt-4.1"),
  "4.1-mini": azure41("gpt-4.1-mini"),
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

  if (user.freeMessages <= 0) {
    return new Response("Out of available messages", { status: 400 });
  }

  const { id, message, model: modelId } = await req.json();
  const model = allowedModels[modelId as keyof typeof allowedModels];

  if (!model) {
    return new Response("Invalid model", { status: 400 });
  }

  const existingConversation = await getConversation(id);
  let existingMessages: Message[] = [];

  const { experimental_attachments, ...textMessage } = message;

  if (existingConversation?.messages && existingConversation.messages.length > 1) {
    if (experimental_attachments && awsConfigured) {
      try {
        const attachments = await uploadAttachments(
          experimental_attachments,
          user.id,
          id
        );
        textMessage.files = attachments;
      } catch (error) {
        console.error(error);
        return new Response("file_too_large", { status: 400 });
      }
    }

    const conversation = await appendMessageToConversation(textMessage, id);
    existingMessages = conversation?.messages || [];
  }

  const messages = appendClientMessage({
    messages: existingMessages,
    message,
  });

  const filteredMessages = filterMessages(messages, modelId);

  const result = streamText({
    model,
    messages: filteredMessages,
    maxSteps: 5,
    system: systemPrompt,
    temperature: modelId === "o4-mini" ? 1 : undefined,
    providerOptions: getProviderOptions(modelId),
    experimental_transform: smoothStream({
      delayInMs: 10,
    }),
    onFinish: async ({ response }) => {
      const updatedMessages = appendResponseMessages({
        messages,
        responseMessages: response.messages,
      });

      if (existingConversation?.title === "New Chat") {
        await updateConversationTitle(id, updatedMessages);
      }

      await saveMessage(updatedMessages[updatedMessages.length - 1], id);
      await decrementFreeMessages(user.id);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const end = Date.now();
  console.log(`Response time: ${end - start}ms`);

  result.consumeStream();

  return result.toDataStreamResponse({
    sendReasoning: true,
    getErrorMessage: (error: any) => error.data.error.code,
  });
}

function filterMessages(messages: Message[], modelId: string) {
  const model = getModel(modelId);
  const imageSupport =
    model?.features?.some((feature) => feature.name === "Images") || false;
  const pdfSupport = model?.features?.some((feature) => feature.name === "PDFs") || false;

  return messages.map((message: Message) => ({
    ...message,
    experimental_attachments: filterUnsupportedAttachments(
      message.experimental_attachments || [],
      imageSupport,
      pdfSupport
    ),
  }));
}

function filterUnsupportedAttachments(
  attachments: Attachment[],
  imageSupport: boolean,
  pdfSupport: boolean
) {
  return attachments.filter((attachment) => {
    if (imageSupport && attachment.contentType?.startsWith("image/")) return true;
    if (pdfSupport && attachment.contentType?.startsWith("application/pdf")) return true;
    return false;
  });
}
