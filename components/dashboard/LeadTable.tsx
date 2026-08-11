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
      <h1 className="text-2xl font-bold mb-4">Leads</h1>
      <div className="flex gap-2 mb-4">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => filterBy(s)}
            className={`px-3 py-1 rounded border ${
              filter === s ? "bg-black text-white" : "bg-white"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2">Name</th>
            <th className="p-2">Phone</th>
            <th className="p-2">Service</th>
            <th className="p-2">Status</th>
            <th className="p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => (
            <tr key={l.id} className="border-b">
              <td className="p-2">{l.name ?? "-"}</td>
              <td className="p-2">{l.phone ?? "-"}</td>
              <td className="p-2">{l.serviceInterest ?? "-"}</td>
              <td className="p-2">
                <span className={`px-2 py-1 rounded text-xs ${STATUS_COLORS[l.status]}`}>
                  {l.status}
                </span>
              </td>
              <td className="p-2">{new Date(l.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {leads.length === 0 && <p className="text-gray-500 mt-4">No leads found.</p>}
    </div>
  );
}
