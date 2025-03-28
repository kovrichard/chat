import "server-only";

import { getUserFromSession } from "@/lib/dao/users";
import prisma from "@/lib/prisma";

export type OnFinishResult = {
  text: string;
  reasoning?: string;
};

export async function saveResultAsAssistantMessage(
  result: OnFinishResult,
  conversationId: string
) {
  const reasoning = result.reasoning;
  const content = result.text;

  await saveMessage(content, "assistant", conversationId, reasoning);
}

export async function saveUserMessage(content: string, conversationId: string) {
  await saveMessage(content, "user", conversationId);
}

async function saveMessage(
  content: string,
  role: string,
  conversationId: string,
  reasoning?: string
) {
  const user = await getUserFromSession();

  const newMessage = await prisma.message.create({
    data: {
      content,
      role,
      reasoning,
      conversationId,
    },
  });

  await prisma.conversation.update({
    where: {
      id: conversationId,
      userId: user.id,
    },
    data: {
      lastMessageAt: new Date(),
    },
  });

  return newMessage;
}
