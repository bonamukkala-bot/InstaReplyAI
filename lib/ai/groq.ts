import Groq from "groq-sdk";
import { buildSystemPrompt } from "./prompt-builder";
import { prisma } from "@/lib/db/prisma";
import type { Business } from "@prisma/client";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface AIReplyResult {
  text: string;
  confidence: number;
}

export async function getAIReply(
  message: string,
  business: Business
): Promise<AIReplyResult> {
  const faqs = await prisma.fAQ.findMany({
    where: { businessId: business.id, isActive: true },
  });

  const systemPrompt = buildSystemPrompt(business, faqs);

  try {
    const res = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 300,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    const raw = res.choices[0]?.message?.content ?? "{}";
    const clean = raw.replace(/```json\s*|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return {
      text: String(parsed.reply ?? ""),
      confidence: Number(parsed.confidence ?? 0.5),
    };
  } catch (err) {
    console.error("AI reply failed:", err);
    return {
      text: "I would like to connect you with our team.",
      confidence: 0,
    };
  }
}
