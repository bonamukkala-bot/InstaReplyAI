import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

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
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Leads (30d)" value={totalLeads} />
        <StatCard label="Hot Leads" value={hotLeads} color="text-red-600" />
        <StatCard label="Escalated" value={escalatedLeads} color="text-orange-600" />
        <StatCard label="Conversations" value={totalConversations} />
      </div>
      <div className="mt-8 flex gap-4">
        <a href="/dashboard/leads" className="underline text-blue-600">View Leads</a>
        <a href="/dashboard/faqs" className="underline text-blue-600">Manage FAQs</a>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`text-3xl font-bold mt-1 ${color ?? ""}`}>{value}</div>
    </div>
  );
}
