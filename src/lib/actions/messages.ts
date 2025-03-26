"use server";

import "server-only";

import { getUserFromSession } from "@/lib/dao/users";
import prisma from "@/lib/prisma";
import { PartialMessage } from "@/types/chat";

export async function saveMessage(message: PartialMessage, conversationId: string) {
  const user = await getUserFromSession();

  const newMessage = await prisma.message.create({
    data: {
      ...message,
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
