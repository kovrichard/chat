import { updateConversationTitle } from "@/lib/actions/conversations";
import { awsConfigured } from "@/lib/aws/s3";
import { getMemoryPrompt } from "@/lib/backend/prompts/memory-prompt";
import systemPrompt from "@/lib/backend/prompts/system-prompt";
import { getModel } from "@/lib/backend/providers";
import { academicSearchConfigured } from "@/lib/backend/tools/academic-search";
import {
  buildAcademicPrompt,
  retrieveSources,
} from "@/lib/backend/tools/academic-search";
import { memoryTool } from "@/lib/backend/tools/memory";
import { filterMessages } from "@/lib/backend/utils";
import {
  appendMessageToConversation,
  getConversation,
  lockConversation,
  unlockConversation,
} from "@/lib/dao/conversations";
import { getMessages, saveMessage, uploadAttachments } from "@/lib/dao/messages";
import { decrementFreeMessages, getUserFromSession } from "@/lib/dao/users";
import rateLimit from "@/lib/rate-limiter";
import type { AnthropicProviderOptions } from "@ai-sdk/anthropic";
import {
  type Message,
  appendClientMessage,
  appendResponseMessages,
  smoothStream,
  streamText,
} from "ai";
import type { NextRequest } from "next/server";

const limiter = rateLimit(50, 60);

export const maxDuration = 55;

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

  const { id, message, model: modelId, browse, academic } = await req.json();
  const { model, supportsTools } = getModel(modelId, browse);

  if (!model) {
    return new Response("Invalid model", { status: 400 });
  }

  const [existingConversation, conversationMessages] = await Promise.all([
    getConversation(id),
    getMessages(id),
  ]);

  let existingMessages: Message[] = conversationMessages.messages;

  const { experimental_attachments, ...textMessage } = message;

  const lock = await acquireConversationLock(id);

  if (!lock) {
    return new Response("conversation_locked", { status: 400 });
  }

  if (experimental_attachments && awsConfigured) {
    try {
      const attachments = await uploadAttachments(experimental_attachments, user.id, id);
      textMessage.files = attachments;
    } catch (error) {
      console.error(error);
      await unlockConversation(id);
      return new Response("file_too_large", { status: 400 });
    }
  }

  let messages = existingMessages;

  if (message.content) {
    const [newMessage] = await appendMessageToConversation(textMessage, id);
    existingMessages = [...existingMessages, newMessage];

    messages = appendClientMessage({
      messages: existingMessages,
      message,
    });
  }

  const filteredMessages = filterMessages(messages, modelId);
  let academicPrompt = "";

  if (academic && academicSearchConfigured) {
    const academicSources = await retrieveSources(filteredMessages);
    academicPrompt = buildAcademicPrompt(academicSources);

    await decrementFreeMessages(user.id);
  }

  const tools: any = {};

  let memoryPrompt = "";

  if (user.memoryEnabled) {
    memoryPrompt = await getMemoryPrompt();

    if (supportsTools) {
      tools.memory = memoryTool;
    }
  }

  const extendedSystemPrompt = `${systemPrompt}${memoryPrompt}${academicPrompt}`;
  const anthropicThinking =
    modelId === "claude-sonnet-4-20250514" ||
    modelId === "claude-opus-4-20250514" ||
    modelId === "claude-3-7-sonnet-20250219";

  const result = streamText({
    model,
    messages: filteredMessages,
    system: extendedSystemPrompt,
    maxSteps: 2,
    temperature: modelId === "o4-mini" ? 1 : undefined,
    experimental_transform: smoothStream({
      delayInMs: 10,
    }),
    tools,
    providerOptions: {
      anthropic: {
        thinking: anthropicThinking
          ? { type: "enabled", budgetTokens: 5000 }
          : { type: "disabled" },
      } satisfies AnthropicProviderOptions,
    },
    onFinish: async ({ response }) => {
      try {
        const updatedMessages = appendResponseMessages({
          messages,
          responseMessages: response.messages,
        });

        if (existingConversation?.title === "New Chat") {
          await updateConversationTitle(id, updatedMessages);
        }

        const lastMessage = updatedMessages[updatedMessages.length - 1];
        const sources = await result.sources;
        sources.map((source) => {
          lastMessage.parts?.push({
            type: "source",
            source,
          });
        });

        await saveMessage(lastMessage, id);
        await decrementFreeMessages(user.id);
      } finally {
        await unlockConversation(id);
      }
    },
    onError: async (error) => {
      console.error(error);
      await unlockConversation(id);
    },
  });

  const end = Date.now();
  console.log(`Response time: ${end - start}ms`);

  result.consumeStream();

  return result.toDataStreamResponse({
    sendReasoning: true,
    sendSources: true,
    getErrorMessage: (error: any) => error.data.error.code,
  });
}

async function acquireConversationLock(conversationId: string): Promise<boolean> {
  for (let i = 0; i < 15; i++) {
    const locked = await lockConversation(conversationId);
    if (locked) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return false;
}
