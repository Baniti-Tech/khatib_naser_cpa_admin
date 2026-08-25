"use client";

import { useEffect, useState } from "react";
import type { ContentSection } from "@/lib/content-schema";
import { ImageField, type FieldStatus } from "@/components/ImageField";

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
  const [mediaIds, setMediaIds] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<FieldStatus | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingSlots, setUploadingSlots] = useState<Record<string, boolean>>(
    {},
  );
  const [pendingSlots, setPendingSlots] = useState<Record<string, boolean>>(
    {},
  );
  const uploadingCount = Object.values(uploadingSlots).filter(Boolean).length;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/content?sectionId=${section.id}`);
        const data = await res.json();
        if (cancelled || !data.ok) return;
        if (data.values) {
          setValues((prev) => ({ ...prev, ...data.values }));
        }
        if (data.mediaIds) {
          setMediaIds(data.mediaIds);
        }
        if (data.mode === "api") {
          setStatus({ type: "info", message: "נטען מהאתר החי" });
        } else if (data.mode === "disconnected") {
          setStatus({
            type: "warning",
            message:
              "אין חיבור ל-CMS בסביבה הזו. שמירה לאתר החי דורשת התחברות ל-API ב-Vercel.",
          });
        }
      } catch {
        /* keep defaults */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [section.id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (uploadingCount > 0) {
      setStatus({
        type: "error",
        message: "המתינו עד שהתמונה תעלה ואז לחצו שמור.",
      });
      return;
    }
    if (Object.values(pendingSlots).some(Boolean)) {
      setStatus({
        type: "error",
        message:
          "הקובץ שנבחר לא הועלה ל-CMS. בחרו שוב, המתינו להצלחה, ורק אז שמרו.",
      });
      return;
    }
    setSaving(true);
    setStatus(null);

    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId: section.id,
          values,
          mediaIds,
        }),
      });
      const data = await res.json();
      if (data.ok && data.warning) {
        setStatus({ type: "warning", message: data.warning });
      } else if (data.ok) {
        setStatus({
          type: "success",
          message:
            "נשמר במסד הנתונים של האתר החי. רעננו את khatib-naser.co.il עכשיו.",
        });
      } else {
        setStatus({
          type: "error",
          message: data.error ?? "השמירה לאתר החי נכשלה.",
        });
      }
    } catch {
      setStatus({ type: "error", message: "שגיאת רשת — נסו שוב" });
    } finally {
      setSaving(false);
    }
  }

  const statusClass =
    status?.type === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : status?.type === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : status?.type === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-brand-pale bg-brand-pale/60 text-brand-navy";

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-brand-navy">{section.title}</h2>
            <p className="mt-1 text-sm text-brand-dark/60">{section.description}</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
            נשמר לאתר החי
          </span>
        </div>
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
            <ImageField
              value={values[field.key] ?? ""}
              imageSlot={field.imageSlot}
              onChange={({ url, mediaId }) => {
                setValues((prev) => ({ ...prev, [field.key]: url }));
                if (mediaId) {
                  setMediaIds((prev) => ({ ...prev, [field.key]: mediaId }));
                  setPendingSlots((prev) => ({ ...prev, [field.key]: false }));
                }
              }}
              onUploadState={({ uploading, filePending }) => {
                setUploadingSlots((prev) => ({
                  ...prev,
                  [field.key]: uploading,
                }));
                setPendingSlots((prev) => ({
                  ...prev,
                  [field.key]: filePending,
                }));
              }}
              onStatus={setStatus}
            />
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

      {status ? (
        <div className={`rounded-2xl border px-5 py-3 text-sm ${statusClass}`}>
          {status.message}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-4">
        <button
          type="submit"
          disabled={saving || uploadingCount > 0}
          className="rounded-xl bg-brand-navy px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {saving
            ? "שומר..."
            : uploadingCount > 0
              ? "מעלה תמונה..."
              : "שמור לאתר החי"}
        </button>
      </div>
    </form>
  );
}
