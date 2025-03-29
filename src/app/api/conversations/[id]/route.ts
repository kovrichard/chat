import { getUserFromSession } from "@/lib/dao/users";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getUserFromSession();

  const conversation = await prisma.conversation.findUnique({
    where: {
      id: id,
      userId: user.id,
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
