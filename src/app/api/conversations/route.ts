import { getConversations } from "@/lib/dao/conversations";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "15");

  const { conversations, hasMore } = await getConversations(page, limit);

  return NextResponse.json({
    conversations,
    hasMore,
  });
}
