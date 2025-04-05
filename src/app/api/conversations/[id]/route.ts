import { getUserIdFromSession } from "@/lib/dao/users";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  return NextResponse.json(conversation);
}
