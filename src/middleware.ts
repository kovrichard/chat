import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

const publicUrls = [
  "/",
  "/login",
  "/register",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
];

export default auth((req) => {
  if (!req.auth && !publicUrls.includes(req.nextUrl.pathname)) {
    const newUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(newUrl);
  }

  if (!isAuthenticated(req)) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": "Basic" },
    });
  }
});

function isAuthenticated(req: NextRequest) {
  const authUsername = process.env.AUTH_USERNAME;
  const authPassword = process.env.AUTH_PASSWORD;

  if (!authUsername || !authPassword) {
    return true;
  }

  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");

  if (!authHeader) {
    return false;
  }

  const [username, password] = Buffer.from(authHeader.split(" ")[1], "base64")
    .toString()
    .split(":");

  const userOk = username === authUsername;
  const passOk = password === authPassword;

  return userOk && passOk;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*.svg|.*.png|favicon.ico).*)"],
};
