import "dotenv/config";
import { redis } from "@/lib/redis/client";
import { prisma } from "@/lib/db/prisma";
import { matchFAQ, incrementFAQMatchCount } from "@/lib/rules/matcher";
import { getAIReply } from "@/lib/ai/groq";
import { getOrCreateConversation } from "@/lib/instagram/conversations";
import { runLeadCaptureIfNeeded } from "@/lib/leads/capture";
import { updateLeadTag } from "@/lib/rules/tagger";
import { sendStaffAlert } from "@/lib/notifications/email";
import { markHandoff } from "@/lib/instagram/handoff";

const CONFIDENCE_THRESHOLD = 0.6;
const ESCALATION_KEYWORDS = ["speak to someone", "human", "agent", "call me"];

interface QueueEvent {
  senderId: string;
  recipientId: string;
  messageText: string;
  timestamp: number;
  messageId?: string;
}

function looksLikeAQuestion(text: string): boolean {
  const t = text.toLowerCase();
  if (t.includes("?")) return true;
  const questionStarters = ["what", "when", "where", "how", "do you", "can i", "is there", "are there"];
  return questionStarters.some((q) => t.trim().startsWith(q));
}

async function fireNotificationIfNeeded(conversationId: string, newStatus: string, businessId: string) {
  if (newStatus !== "HOT" && newStatus !== "ESCALATED") return;
  const business = await prisma.business.findUnique({ where: { id: businessId } });
  const lead = await prisma.lead.findUnique({ where: { conversationId } });
  if (!business || !lead) return;
  await sendStaffAlert(business.notifyEmails, newStatus, {
    name: lead.name,
    phone: lead.phone,
    serviceInterest: lead.serviceInterest,
  });
}

async function handleFaqOrAi(business: any, conversation: any, event: QueueEvent): Promise<boolean> {
  let mainReplySent = false;
  let lowConfidence = false;
  const faq = await matchFAQ(event.messageText, business.id);
  if (faq) {
    console.log("FAQ MATCH ->", faq.question);
    console.log("Would reply:", faq.answer);
    await incrementFAQMatchCount(faq.id);
    mainReplySent = true;
  } else {
    console.log("No FAQ match - falling back to AI...");
    const ai = await getAIReply(event.messageText, business);
    console.log("AI confidence:", ai.confidence);
    if (ai.confidence < CONFIDENCE_THRESHOLD) {
      console.log("LOW CONFIDENCE - handing off to human");
      lowConfidence = true;
      await markHandoff(conversation.id, "LOW_CONFIDENCE");
    } else {
      console.log("Would reply (AI):", ai.text);
      mainReplySent = true;
    }
  }
  const newStatus = await updateLeadTag(conversation.id, event.messageText, { lowConfidence });
  if (newStatus) {
    console.log("Lead status ->", newStatus);
    await fireNotificationIfNeeded(conversation.id, newStatus, business.id);
  }
  return mainReplySent;
}

async function processOne(raw: string) {
  const event: QueueEvent = JSON.parse(raw);
  if (!event.messageText) return;
  console.log("\n--- New message ---");
  console.log("From:", event.senderId, "| Text:", event.messageText);
  const business = await prisma.business.findUnique({ where: { instagramPageId: event.recipientId } });
  if (!business) {
    console.log("No business found for page:", event.recipientId, "- skipping");
    return;
  }
  const conversation = await getOrCreateConversation(business.id, event.senderId);
  if (conversation.status === "WAITING_HUMAN") {
    console.log("Conversation is WAITING_HUMAN - bot stays silent, skipping");
    return;
  }
  await prisma.lead.upsert({
    where: { conversationId: conversation.id },
    create: { conversationId: conversation.id, businessId: business.id },
    update: {},
  });
  const stateKey = `lead:state:${conversation.id}`;
  const captureState = await redis.get(stateKey);
  const isCapturing = captureState && captureState !== "IDLE" && captureState !== "COMPLETE";
  const isEscalation = ESCALATION_KEYWORDS.some((k) => event.messageText.toLowerCase().includes(k));
  if (isEscalation) {
    console.log("ESCALATION KEYWORD MATCHED - handing off to human");
    await markHandoff(conversation.id, "ESCALATION_KEYWORD");
    const newStatus = await updateLeadTag(conversation.id, event.messageText, { escalationKeywordMatched: true });
    if (newStatus) {
      console.log("Lead status ->", newStatus);
      await fireNotificationIfNeeded(conversation.id, newStatus, business.id);
    }
    return;
  }
  if (isCapturing) {
    if (looksLikeAQuestion(event.messageText)) {
      console.log("Mid-capture, but this looks like a question - answering it instead of treating as an answer");
      await handleFaqOrAi(business, conversation, event);
      return;
    }
    console.log("Mid-capture (" + captureState + ") - treating message as the answer");
    const followUp = await runLeadCaptureIfNeeded(conversation, business, event.messageText);
    if (followUp) console.log("Would reply:", followUp);
    const newStatus = await updateLeadTag(conversation.id, event.messageText);
    if (newStatus) {
      console.log("Lead status ->", newStatus);
      await fireNotificationIfNeeded(conversation.id, newStatus, business.id);
    }
    return;
  }
  const mainReplySent = await handleFaqOrAi(business, conversation, event);
  if (mainReplySent) {
    const followUp = await runLeadCaptureIfNeeded(conversation, business, event.messageText);
    if (followUp) {
      console.log("Would ALSO send (lead capture):", followUp);
    }
  }
}

async function main() {
  console.log("Worker started, listening on dm:queue");
  while (true) {
    try {
      const item = await redis.brpop("dm:queue", 0);
      if (!item) continue;
      await processOne(item[1]).catch((e) => {
        console.error("Process failed:", e);
      });
    } catch (e) {
      console.error("Worker loop error:", e);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

main();