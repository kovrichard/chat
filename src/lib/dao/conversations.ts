import "server-only";

import { getUserIdFromSession } from "@/lib/dao/users";
import prisma from "@/lib/prisma";

export async function getConversation(id: string) {
  const userId = await getUserIdFromSession();

  const conversation = await prisma.conversation.findUnique({
    where: {
      id: id,
      userId,
    },
    select: {
      id: true,
      title: true,
      model: true,
      messages: {
        select: {
          id: true,
          content: true,
          role: true,
          reasoning: true,
          signature: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  return conversation;
}

export async function getConversations(
  page: number,
  limit: number,
  search?: string
): Promise<{ conversations: any[]; hasMore: boolean }> {
  const userId = await getUserIdFromSession();
  const skip = (page - 1) * limit;

  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      where: {
        userId,
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                {
                  messages: {
                    some: { content: { contains: search, mode: "insensitive" } },
                  },
                },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        title: true,
        lastMessageAt: true,
        messages: {
          select: {
            id: true,
            content: true,
          },
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.conversation.count({
      where: {
        userId,
      },
    }),
  ]);

  const hasMore = skip + conversations.length < total;

  return {
    conversations,
    hasMore,
  };
}
