import "server-only";

import { getUserIdFromSession } from "@/lib/dao/users";
import prisma from "@/lib/prisma";
import { Message, UIMessage } from "ai";
import { v4 as uuidv4 } from "uuid";

type ReasoningDetail =
  | {
      type: "text";
      text: string;
      signature?: string;
    }
  | {
      type: "redacted";
      data: string;
    };

export type OnFinishResult = {
  text: string;
  reasoning?: string;
  reasoningDetails?: ReasoningDetail[];
};

export async function saveMessage(message: Message | UIMessage, conversationId: string) {
  const userId = await getUserIdFromSession();

  const newMessage = await prisma.message.create({
    data: {
      ...message,
      id: uuidv4(),
      parts: JSON.stringify(message.parts),
      toolInvocations: JSON.stringify(message.toolInvocations),
      conversationId,
    },
  });

  await prisma.conversation.update({
    where: {
      id: conversationId,
      userId,
    },
    data: {
      lastMessageAt: new Date(),
    },
  });

  return newMessage;
}
