"use client";

import { useState } from "react";

export function FAQEditor({ initialFaqs }: { initialFaqs: any[] }) {
  const [faqs, setFaqs] = useState(initialFaqs);
  const [draft, setDraft] = useState({ question: "", answer: "", keywords: "" });
  const [saving, setSaving] = useState(false);

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

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">FAQ Manager</h1>

      <div className="border rounded p-4 space-y-2 mb-6 bg-white">
        <input
          placeholder="Question (e.g. What are your hours?)"
          value={draft.question}
          onChange={(e) => setDraft({ ...draft, question: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <input
          placeholder="Keywords, comma separated (e.g. hours, open, timing)"
          value={draft.keywords}
          onChange={(e) => setDraft({ ...draft, keywords: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <textarea
          placeholder="Answer"
          value={draft.answer}
          onChange={(e) => setDraft({ ...draft, answer: e.target.value })}
          className="w-full p-2 border rounded"
          rows={3}
        />
        <button
          onClick={create}
          disabled={saving}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {saving ? "Saving..." : "Add FAQ"}
        </button>
      </div>

      <div className="space-y-3">
        {faqs.map((f) => (
          <div key={f.id} className="border rounded p-4 bg-white">
            <div className="font-semibold">{f.question}</div>
            <div className="text-sm text-gray-500">
              Keywords: {f.keywords.join(", ")} - Matched {f.matchCount} times
            </div>
            <div className="mt-2">{f.answer}</div>
          </div>
        ))}
        {faqs.length === 0 && <p className="text-gray-500">No FAQs yet - add one above.</p>}
      </div>
    </div>
  );
}
