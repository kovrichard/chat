import { getConversations } from "@/lib/dao/conversations";
import rateLimit from "@/lib/rate-limiter";
import { NextRequest, NextResponse } from "next/server";

const limiter = rateLimit(500, 60);

export async function GET(req: NextRequest) {
  const response = limiter(req);
  if (response) return response;

  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "15");
  const search = searchParams.get("search") || undefined;

  const { conversations, hasMore } = await getConversations(page, limit, search);

  return NextResponse.json({
    conversations,
    hasMore,
  });
}
