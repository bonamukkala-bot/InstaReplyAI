import { prisma } from "@/lib/db/prisma";
import { redis } from "@/lib/redis/client";
import type { Business, Conversation } from "@prisma/client";

type CaptureState = "IDLE" | "AWAITING_NAME" | "AWAITING_PHONE" | "AWAITING_SERVICE" | "COMPLETE";
const TTL = 86400; // 24 hours

export async function getOrCreateLead(conversationId: string, businessId: string) {
  return prisma.lead.upsert({
    where: { conversationId },
    create: { conversationId, businessId },
    update: {},
  });
}

export async function runLeadCaptureIfNeeded(
  conversation: Conversation,
  business: Business,
  lastInboundText: string
): Promise<string | null> {
  const stateKey = `lead:state:${conversation.id}`;
  const state = ((await redis.get(stateKey)) ?? "IDLE") as CaptureState;
  const lead = await getOrCreateLead(conversation.id, business.id);

  if (state === "IDLE" && !lead.name) {
    await redis.setex(stateKey, TTL, "AWAITING_NAME");
    return "By the way, may I know your name?";
  }

  if (state === "AWAITING_NAME") {
    await prisma.lead.update({
      where: { id: lead.id },
      data: { name: lastInboundText.slice(0, 100) },
    });
    await redis.setex(stateKey, TTL, "AWAITING_PHONE");
    return `Thanks, ${lastInboundText.slice(0, 50)}! Could you share your phone number so we can follow up?`;
  }

  if (state === "AWAITING_PHONE") {
    await prisma.lead.update({
      where: { id: lead.id },
      data: { phone: lastInboundText.replace(/[^\d+]/g, "").slice(0, 20) },
    });
    const services = (business.services as Array<{ name: string }> | null) ?? [];
    const top3 = services.slice(0, 3).map((s) => s.name).join(", ");
    await redis.setex(stateKey, TTL, "AWAITING_SERVICE");
    return `Which service are you interested in?${top3 ? ` (e.g., ${top3})` : ""}`;
  }

  if (state === "AWAITING_SERVICE") {
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        serviceInterest: lastInboundText.slice(0, 200),
        capturedAt: new Date(),
      },
    });
    await redis.setex(stateKey, TTL, "COMPLETE");
    return "Perfect, thank you! Our team will be in touch soon.";
  }

  return null; // COMPLETE - nothing more to ask
}
