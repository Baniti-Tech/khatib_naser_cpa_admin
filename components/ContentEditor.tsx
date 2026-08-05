"use client";

import { useState } from "react";
import type { ContentSection } from "@/lib/content-schema";

export function ContentEditor({ section }: { section: ContentSection }) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of section.fields) {
      initial[field.key] = Array.isArray(field.value)
        ? field.value.join("\n\n")
        : field.value;
    }
    return initial;
  });
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId: section.id, values }),
      });
      const data = await res.json();
      setStatus(data.ok ? "נשמר (מצב דמו / stub)" : data.error ?? "שגיאה בשמירה");
    } catch {
      setStatus("שגיאת רשת");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-brand-navy">{section.title}</h2>
        <p className="mt-1 text-sm text-brand-dark/60">{section.description}</p>
      </div>

      {section.fields.map((field) => (
        <div
          key={field.key}
          className="rounded-2xl border border-border bg-white p-5 shadow-sm"
        >
          <label className="mb-2 block text-sm font-semibold text-brand-navy">
            {field.label}
          </label>

          {field.type === "image" ? (
            <div className="space-y-3">
              <input
                type="text"
                value={values[field.key] ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                }
                className="w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-brand-medium"
                dir="ltr"
              />
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !field.imageSlot) return;
                  const body = new FormData();
                  body.append("file", file);
                  body.append("slotKey", field.imageSlot);
                  const res = await fetch("/api/upload", { method: "POST", body });
                  const data = await res.json();
                  if (data.ok && data.publicUrl) {
                    setValues((prev) => ({
                      ...prev,
                      [field.key]: data.publicUrl,
                    }));
                    setStatus("העלאה בוצעה (מצב דמו / stub)");
                  } else {
                    setStatus(data.error ?? "העלאה נכשלה");
                  }
                }}
                className="block w-full text-sm"
              />
              <p className="text-xs text-brand-dark/45">
                slot: {field.imageSlot} · יישמר ב-GCS אחרי ההגדרה
              </p>
            </div>
          ) : field.type === "textarea" || field.type === "list" ? (
            <textarea
              rows={field.type === "list" ? 8 : 5}
              value={values[field.key] ?? ""}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
              }
              className="w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-brand-medium"
            />
          ) : (
            <input
              type="text"
              value={values[field.key] ?? ""}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
              }
              className="w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-brand-medium"
              dir={field.type === "phone" ? "ltr" : undefined}
            />
          )}
        </div>
      ))}

      <div className="flex items-center justify-between gap-4">
        {status ? (
          <p className="text-sm text-brand-medium">{status}</p>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-brand-navy px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {saving ? "שומר..." : "שמור שינויים"}
        </button>
      </div>
    </form>
  );
}
