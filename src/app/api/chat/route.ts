import { updateConversationTitle } from "@/lib/actions/conversations";
import { awsConfigured } from "@/lib/aws/s3";
import { allowedModels, getProviderOptions } from "@/lib/backend/models";
import systemPrompt from "@/lib/backend/prompts/system-prompt";
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

  const { id, message, model: modelId } = await req.json();
  const model = allowedModels[modelId as keyof typeof allowedModels];

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
