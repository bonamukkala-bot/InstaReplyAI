import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { invalidateFAQCache } from "@/lib/rules/matcher";
import { z } from "zod";

const schema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  keywords: z.array(z.string()).min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  const businessId = (session?.user as any)?.businessId as string | undefined;
  if (!businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = schema.parse(await req.json());
  const faq = await prisma.fAQ.create({
    data: { ...body, businessId },
  });
  await invalidateFAQCache(businessId);
  return NextResponse.json(faq, { status: 201 });
}
