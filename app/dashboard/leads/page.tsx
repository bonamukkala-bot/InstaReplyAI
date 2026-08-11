import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LeadTable } from "@/components/dashboard/LeadTable";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const session = await auth();
  const businessId = (session?.user as any)?.businessId as string | undefined;
  if (!businessId) redirect("/login");

  const where: any = { businessId };
  if (searchParams.status) where.status = searchParams.status;

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return <LeadTable leads={leads} />;
}
