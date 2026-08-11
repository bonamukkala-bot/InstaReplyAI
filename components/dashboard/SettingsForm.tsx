"use client";

import { useState } from "react";

export function SettingsForm({ business }: { business: any }) {
  const [name, setName] = useState(business.name);
  const [tone, setTone] = useState(business.tone);
  const [notifyEmails, setNotifyEmails] = useState(business.notifyEmails.join(", "));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/business", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          tone,
          notifyEmails,
        }),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted">Manage your business profile and preferences</p>
      </div>

      <form onSubmit={submit} className="rounded-lg border border-border bg-surface p-6">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Business Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Tone</label>
            <input
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full rounded-md border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Notification Emails</label>
            <input
              value={notifyEmails}
              onChange={(e) => setNotifyEmails(e.target.value)}
              className="w-full rounded-md border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            <p className="mt-1 text-xs text-muted">Comma-separated email addresses</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
            {saved && (
              <span className="text-sm text-green-600">Saved!</span>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
