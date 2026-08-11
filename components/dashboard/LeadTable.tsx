"use client";

import { useRouter, useSearchParams } from "next/navigation";

const STATUSES = ["ALL", "NEW", "WARM", "HOT", "ESCALATED", "RESOLVED"];

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-gray-200 text-gray-800",
  WARM: "bg-yellow-200 text-yellow-800",
  HOT: "bg-red-200 text-red-800",
  ESCALATED: "bg-orange-200 text-orange-800",
  RESOLVED: "bg-green-200 text-green-800",
};

export function LeadTable({ leads }: { leads: any[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const filter = params.get("status") ?? "ALL";

  const filterBy = (status: string) => {
    if (status === "ALL") {
      router.push("/dashboard/leads");
    } else {
      router.push(`/dashboard/leads?status=${status}`);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Leads</h1>
        <p className="mt-1 text-sm text-muted">Track and manage your captured leads</p>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => filterBy(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === s
                ? "bg-accent text-white"
                : "bg-surface border border-border text-muted hover:bg-muted/10"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="rounded-lg border border-border bg-surface">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left text-xs uppercase text-muted border-b border-border">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Phone</th>
              <th className="p-4 font-medium">Service</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b border-border last:border-b-0 hover:bg-muted/5 transition">
                <td className="p-4">{l.name ?? "-"}</td>
                <td className="p-4">{l.phone ?? "-"}</td>
                <td className="p-4">{l.serviceInterest ?? "-"}</td>
                <td className="p-4">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs ${STATUS_COLORS[l.status]}`}>
                    {l.status}
                  </span>
                </td>
                <td className="p-4">{new Date(l.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && (
          <div className="flex items-center justify-center p-8 text-muted">
            <p>No leads found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
