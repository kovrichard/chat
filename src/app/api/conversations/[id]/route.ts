import { getConversation } from "@/lib/dao/conversations";
import rateLimit from "@/lib/rate-limiter";
import { NextRequest, NextResponse } from "next/server";

const limiter = rateLimit(50, 30);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const response = limiter(request);
  if (response) return response;

  const { id } = await params;

  const conversation = await getConversation(id);

  return NextResponse.json(conversation);
}
