import { getUserFromSession } from "@/lib/dao/users";
import rateLimit from "@/lib/rate-limiter";
import { NextRequest, NextResponse } from "next/server";

const limiter = rateLimit(100, 60);

export async function GET(request: NextRequest) {
  const response = limiter(request);
  if (response) return response;

  const user = await getUserFromSession();

  return NextResponse.json({
    plan: user.subscription,
    freeMessages: user.freeMessages,
  });
}
