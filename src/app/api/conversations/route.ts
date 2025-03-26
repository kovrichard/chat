import { getUserFromSession } from "@/lib/dao/users";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const user = await getUserFromSession();

  const conversations = await prisma.conversation.findMany({
    where: {
      userId: user.id,
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
  });

  return NextResponse.json(conversations);
}
