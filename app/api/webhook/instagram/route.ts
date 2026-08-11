import { NextRequest, NextResponse } from "next/server";
import { verifyHmacSignature } from "@/lib/instagram/webhook";
import { redis } from "@/lib/redis/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.INSTAGRAM_VERIFY_TOKEN) {
    console.log("Instagram webhook verified");
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-hub-signature-256") ?? "";

  if (!verifyHmacSignature(rawBody, signature)) {
    console.warn("Invalid HMAC signature, rejecting webhook");
    return new NextResponse("Forbidden", { status: 403 });
  }

  const body = JSON.parse(rawBody);

  for (const entry of body.entry ?? []) {
    for (const messaging of entry.messaging ?? []) {
      const messageId = messaging.message?.mid;
      if (messageId) {
        const dedupKey = `dm:dedup:${messageId}`;
        const isNew = await redis.set(dedupKey, "1", "EX", 5, "NX");
        if (!isNew) continue;
      }

      await redis.lpush(
        "dm:queue",
        JSON.stringify({
          senderId: messaging.sender?.id,
          recipientId: messaging.recipient?.id,
          messageText: messaging.message?.text,
          timestamp: messaging.timestamp,
          messageId,
        })
      );
    }
  }

  return NextResponse.json({ ok: true });
}
