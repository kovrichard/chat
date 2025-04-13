import { getUserFromSession } from "@/lib/dao/users";
import rateLimit from "@/lib/rate-limiter";
import { createStripeBillingPortalUrl } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

const limiter = rateLimit(10, 60);

export async function GET(request: NextRequest) {
  const response = limiter(request);
  if (response) return response;

  const user = await getUserFromSession();

  return NextResponse.json({
    url: await createStripeBillingPortalUrl(user.customerId || ""),
  });
}
