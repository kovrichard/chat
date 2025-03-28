import "server-only";

import { getUserFromSession } from "@/lib/dao/users";
import prisma from "@/lib/prisma";
import { PartialMessage } from "@/types/chat";

export async function saveUserMessage(content: string, conversationId: string) {
  await saveMessage(content, "user", conversationId);
}

async function saveMessage(content: string, role: string, conversationId: string) {
  const user = await getUserFromSession();

  const newMessage = await prisma.message.create({
    data: {
      content,
      role,
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
