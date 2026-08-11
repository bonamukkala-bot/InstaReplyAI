"use client";

import { useState } from "react";

export function FAQEditor({ initialFaqs }: { initialFaqs: any[] }) {
  const [faqs, setFaqs] = useState(initialFaqs);
  const [draft, setDraft] = useState({ question: "", answer: "", keywords: "" });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({ question: "", answer: "", keywords: "" });
  const [savingEdit, setSavingEdit] = useState(false);

  const create = async () => {
    if (!draft.question || !draft.answer || !draft.keywords) return;
    setSaving(true);
    try {
      const res = await fetch("/api/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: draft.question,
          answer: draft.answer,
          keywords: draft.keywords.split(",").map((k) => k.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error("Failed to create FAQ");
      const created = await res.json();
      setFaqs([created, ...faqs]);
      setDraft({ question: "", answer: "", keywords: "" });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    const res = await fetch(`/api/faqs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    if (!res.ok) return;
    setFaqs(faqs.map((f) => (f.id === id ? { ...f, isActive: !current } : f)));
  };

  const startEdit = (faq: any) => {
    setEditingId(faq.id);
    setEditDraft({
      question: faq.question,
      answer: faq.answer,
      keywords: faq.keywords.join(", "),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({ question: "", answer: "", keywords: "" });
  };

  const saveEdit = async (id: string) => {
    if (!editDraft.question || !editDraft.answer || !editDraft.keywords) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/faqs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: editDraft.question,
          answer: editDraft.answer,
          keywords: editDraft.keywords.split(",").map((k) => k.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error("Failed to update FAQ");
      const updated = await res.json();
      setFaqs(faqs.map((f) => (f.id === id ? updated : f)));
      cancelEdit();
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteFaq = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) return;
    const res = await fetch(`/api/faqs/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setFaqs(faqs.filter((f) => f.id !== id));
  };

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">FAQ Manager</h1>
        <p className="mt-1 text-sm text-muted">Manage the questions your AI can answer instantly</p>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6 mb-8">
        <div className="space-y-4">
          <input
            placeholder="Question (e.g. What are your hours?)"
            value={draft.question}
            onChange={(e) => setDraft({ ...draft, question: e.target.value })}
            className="w-full rounded-md border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
          <input
            placeholder="Keywords, comma separated (e.g. hours, open, timing)"
            value={draft.keywords}
            onChange={(e) => setDraft({ ...draft, keywords: e.target.value })}
            className="w-full rounded-md border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
          <textarea
            placeholder="Answer"
            value={draft.answer}
            onChange={(e) => setDraft({ ...draft, answer: e.target.value })}
            className="w-full rounded-md border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            rows={3}
          />
          <button
            onClick={create}
            disabled={saving}
            className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
          >
            {saving ? "Saving..." : "Add FAQ"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {faqs.map((f) => (
          <div
            key={f.id}
            className={`rounded-lg border border-border bg-surface p-5 ${
              f.isActive === false ? "opacity-60" : ""
            }`}
          >
            {editingId === f.id ? (
              <div className="space-y-4">
                <input
                  value={editDraft.question}
                  onChange={(e) => setEditDraft({ ...editDraft, question: e.target.value })}
                  className="w-full rounded-md border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
                <input
                  value={editDraft.keywords}
                  onChange={(e) => setEditDraft({ ...editDraft, keywords: e.target.value })}
                  className="w-full rounded-md border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
                <textarea
                  value={editDraft.answer}
                  onChange={(e) => setEditDraft({ ...editDraft, answer: e.target.value })}
                  className="w-full rounded-md border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(f.id)}
                    disabled={savingEdit}
                    className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
                  >
                    {savingEdit ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-muted transition hover:bg-muted/10"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="font-semibold text-foreground">{f.question}</div>
                <div className="mt-1 text-xs text-muted">
                  Keywords: {f.keywords.join(", ")} - Matched {f.matchCount} times
                </div>
                <div className="mt-3 text-sm text-foreground">{f.answer}</div>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => toggleActive(f.id, f.isActive)}
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition ${
                      f.isActive
                        ? "bg-accent/10 text-accent hover:bg-accent/20"
                        : "bg-muted/10 text-muted hover:bg-muted/20"
                    }`}
                  >
                    {f.isActive ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={() => startEdit(f)}
                    className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-muted transition hover:bg-muted/10"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteFaq(f.id)}
                    className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {faqs.length === 0 && (
          <div className="flex items-center justify-center py-12 text-muted">
            <p>No FAQs yet - add one above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
