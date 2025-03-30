import { getUserFromSession } from "@/lib/dao/users";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getUserFromSession();

  return NextResponse.json({
    freeMessages: user.freeMessages,
  });
}
