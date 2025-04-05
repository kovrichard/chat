"use server";

import "server-only";

import { getUserIdFromSession } from "@/lib/dao/users";
import prisma from "@/lib/prisma";
import { Message } from "ai";

export async function saveMessage(message: Message, conversationId: string) {
  const userId = await getUserIdFromSession();

  const newMessage = await prisma.message.create({
    data: {
      ...message,
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
