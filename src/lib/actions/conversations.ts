"use server";

import "server-only";

import { getUserFromSession } from "@/lib/dao/users";
import prisma from "@/lib/prisma";
import { PartialConversation } from "@/types/chat";

export async function saveConversation(conversation: PartialConversation) {
  const user = await getUserFromSession();

  const newConversation = await prisma.conversation.create({
    data: {
      id: conversation.id,
      title: conversation.title,
      user: {
        connect: {
          id: user.id,
        },
      },
      messages: {
        create: conversation.messages,
      },
    },
  });

  return newConversation;
}

export async function saveConversationTitle(conversationId: string, title: string) {
  const user = await getUserFromSession();

  const updatedConversation = await prisma.conversation.update({
    where: { id: conversationId, userId: user.id },
    data: { title },
  });

  return updatedConversation;
}
