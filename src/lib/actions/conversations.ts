"use server";

import "server-only";

import { getUserIdFromSession } from "@/lib/dao/users";
import prisma from "@/lib/prisma";
import { PartialConversation } from "@/types/chat";

export async function saveConversation(conversation: PartialConversation) {
  const userId = await getUserIdFromSession();

  const newConversation = await prisma.conversation.create({
    data: {
      id: conversation.id,
      title: conversation.title,
      model: conversation.model,
      user: {
        connect: {
          id: userId,
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
  const userId = await getUserIdFromSession();

  const updatedConversation = await prisma.conversation.update({
    where: { id: conversationId, userId },
    data: { title },
  });

  return updatedConversation;
}

export async function saveConversationModel(conversationId: string, modelId: string) {
  const userId = await getUserIdFromSession();

  const updatedConversation = await prisma.conversation.update({
    where: { id: conversationId, userId },
    data: { model: modelId },
  });

  return updatedConversation;
}

export async function deleteConversation(conversationId: string) {
  const userId = await getUserIdFromSession();

  await prisma.conversation.delete({ where: { id: conversationId, userId } });
}
