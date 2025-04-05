import { getUserIdFromSession } from "@/lib/dao/users";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromSession();
  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "15");
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

  return NextResponse.json({
    conversations,
    hasMore,
  });
}
