import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { invalidateFAQCache } from "@/lib/rules/matcher";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const businessId = (session?.user as any)?.businessId as string | undefined;
  if (!businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const faq = await prisma.fAQ.findUnique({
    where: { id: params.id },
  });

  if (!faq || faq.businessId !== businessId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.fAQ.delete({
    where: { id: params.id },
  });

  await invalidateFAQCache(businessId);

  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const businessId = (session?.user as any)?.businessId as string | undefined;
  if (!businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const faq = await prisma.fAQ.findUnique({
    where: { id: params.id },
  });

  if (!faq || faq.businessId !== businessId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  const updated = await prisma.fAQ.update({
    where: { id: params.id },
    data: {
      ...(body.question !== undefined && { question: body.question }),
      ...(body.answer !== undefined && { answer: body.answer }),
      ...(body.keywords !== undefined && { keywords: body.keywords }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  });

  await invalidateFAQCache(businessId);

  return NextResponse.json(updated);
}
