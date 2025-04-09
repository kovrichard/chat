import { getConversation } from "@/lib/dao/conversations";
import { processMessages } from "@/lib/message-processor";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const conversation = await getConversation(id);

  return NextResponse.json(conversation);
}
