import { NextRequest, NextResponse } from "next/server";

function rateLimit(limit: number, intervalSeconds: number) {
  const msInterval = intervalSeconds * 1000;
  const requests = new Map();

  return (req: NextRequest) => {
    const ip =
      req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    if (!requests.has(ip)) {
      requests.set(ip, { count: 0, firstRequest: Date.now() });
    }

    const data = requests.get(ip);
    if (Date.now() - data.firstRequest > msInterval) {
      // Reset the count every interval
      data.count = 0;
      data.firstRequest = Date.now();
    }

    data.count += 1;
    if (data.count > limit) {
      return NextResponse.json(
        { message: "Too many requests, please try again later." },
        { status: 429 }
      );
    }
    requests.set(ip, data);

    return null;
  };
}

export default rateLimit;
