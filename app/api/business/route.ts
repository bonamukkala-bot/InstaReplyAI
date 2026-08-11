import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  const businessId = (session?.user as any)?.businessId as string | undefined;
  if (!businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const updated = await prisma.business.update({
    where: { id: businessId },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.tone !== undefined && { tone: body.tone }),
      ...(body.notifyEmails !== undefined && {
        notifyEmails: Array.isArray(body.notifyEmails)
          ? body.notifyEmails
          : String(body.notifyEmails)
              .split(",")
              .map((e: string) => e.trim())
              .filter(Boolean),
      }),
    },
  });

  return NextResponse.json(updated);
}
