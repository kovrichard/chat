import { getUserIdFromSession } from "@/lib/dao/users";
import prisma from "@/lib/prisma";

export async function getConversations(
  page: number,
  limit: number
): Promise<{ conversations: any[]; hasMore: boolean }> {
  const userId = await getUserIdFromSession();
  const skip = (page - 1) * limit;

  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      where: {
        userId,
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
