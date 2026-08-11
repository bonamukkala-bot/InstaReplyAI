import { prisma } from "@/lib/db/prisma";
import { redis } from "@/lib/redis/client";
import type { LeadStatus } from "@prisma/client";

const PRICE_KEYWORDS = ["price", "cost", "how much", "fee", "charge", "rate"];
const AVAILABILITY_KEYWORDS = ["available", "availability", "slot", "timing", "book", "appointment", "when can"];

const RANK: Record<LeadStatus, number> = {
  NEW: 0,
  WARM: 1,
  HOT: 2,
  ESCALATED: 3,
  RESOLVED: 4,
};

function containsAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((k) => lower.includes(k));
}

export async function updateLeadTag(
  conversationId: string,
  newInbound: string,
  options?: { escalationKeywordMatched?: boolean; lowConfidence?: boolean }
): Promise<LeadStatus | null> {
  const lead = await prisma.lead.findUnique({ where: { conversationId } });
  if (!lead) return null;

  let candidate: LeadStatus = lead.status;

  if (options?.escalationKeywordMatched || options?.lowConfidence) {
    candidate = "ESCALATED";
  } else {
    const sessionKey = `signals:${conversationId}`;
    const signals = JSON.parse((await redis.get(sessionKey)) ?? "{}") as {
      price?: boolean;
      avail?: boolean;
    };

    if (containsAny(newInbound, PRICE_KEYWORDS)) signals.price = true;
    if (containsAny(newInbound, AVAILABILITY_KEYWORDS)) signals.avail = true;
    await redis.setex(sessionKey, 86400, JSON.stringify(signals));

    if (signals.price && signals.avail) {
      candidate = "HOT";
    } else if (lead.name || lead.phone) {
      candidate = "WARM";
    }
  }

  // One-way ratchet: status only increases, never drops back down
  if (RANK[candidate] > RANK[lead.status] && candidate !== "RESOLVED") {
    await prisma.lead.update({
      where: { id: lead.id },
      data: { status: candidate },
    });
    return candidate;
  }

  return null; // no change
}
