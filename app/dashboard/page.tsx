import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Users, Flame, AlertTriangle, MessageCircle } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const businessId = (session?.user as any)?.businessId as string | undefined;
  if (!businessId) redirect("/login");

  const since = new Date(Date.now() - 30 * 86400000);

  const [totalLeads, hotLeads, escalatedLeads, totalConversations] = await Promise.all([
    prisma.lead.count({ where: { businessId, createdAt: { gte: since } } }),
    prisma.lead.count({ where: { businessId, status: "HOT", createdAt: { gte: since } } }),
    prisma.lead.count({ where: { businessId, status: "ESCALATED", createdAt: { gte: since } } }),
    prisma.conversation.count({ where: { businessId, createdAt: { gte: since } } }),
  ]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-muted">Here&apos;s what&apos;s happening with your leads</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Leads (30d)" value={totalLeads} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Hot Leads" value={hotLeads} icon={<Flame className="h-4 w-4" />} />
        <StatCard label="Escalated" value={escalatedLeads} icon={<AlertTriangle className="h-4 w-4" />} />
        <StatCard label="Conversations" value={totalConversations} icon={<MessageCircle className="h-4 w-4" />} />
      </div>
      <div className="mt-8 flex gap-4">
        <a
          href="/dashboard/leads"
          className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
        >
          View Leads
        </a>
        <a
          href="/dashboard/faqs"
          className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
        >
          Manage FAQs
        </a>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center gap-2 text-sm text-muted">
        {icon}
        {label}
      </div>
      <div className="text-3xl font-bold mt-2 text-foreground">{value}</div>
    </div>
  );
}
