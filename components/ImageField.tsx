"use client";

import { useEffect, useId, useRef, useState } from "react";

export type FieldStatus = {
  type: "info" | "success" | "error" | "warning";
  message: string;
};

type ImageFieldProps = {
  value: string;
  imageSlot?: string;
  onChange: (next: { url: string; mediaId?: string }) => void;
  onStatus: (status: FieldStatus) => void;
  onUploadState?: (state: {
    uploading: boolean;
    filePending: boolean;
  }) => void;
};

export function ImageField({
  value,
  imageSlot,
  onChange,
  onStatus,
  onUploadState,
}: ImageFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [broken, setBroken] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setBroken(false);
  }, [preview, value]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const displaySrc = preview || value;

  async function handleFile(file: File) {
    const looksLikeImage =
      file.type.startsWith("image/") ||
      /\.(jpe?g|png|webp|gif)$/i.test(file.name);
    if (!looksLikeImage) {
      onStatus({
        type: "error",
        message: "יש לבחור קובץ תמונה (JPG, PNG או WebP)",
      });
      onUploadState?.({ uploading: false, filePending: true });
      return;
    }

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const localUrl = URL.createObjectURL(file);
    objectUrlRef.current = localUrl;
    setPreview(localUrl);
    setFileName(file.name);
    setLocalError(null);

    if (!imageSlot) {
      onStatus({ type: "error", message: "חסר מזהה סלוט לתמונה" });
      onUploadState?.({ uploading: false, filePending: true });
      return;
    }

    setUploading(true);
    onUploadState?.({ uploading: true, filePending: true });
    onStatus({ type: "info", message: "מעלה את התמונה למסד הנתונים…" });
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("slotKey", imageSlot);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (data.ok && data.publicUrl && data.mediaId) {
        onChange({ url: data.publicUrl, mediaId: data.mediaId });
        onUploadState?.({ uploading: false, filePending: false });
        setLocalError(null);
        onStatus({
          type: "success",
          message: "התמונה הועלתה. לחצו על שמור לאתר החי כדי לעדכן את האתר.",
        });
      } else {
        const message =
          data.error ?? "העלאת התמונה נכשלה — שמירה לא תעדכן את התמונה באתר.";
        onUploadState?.({ uploading: false, filePending: true });
        setLocalError(message);
        onStatus({ type: "error", message });
      }
    } catch {
      const message = "העלאת התמונה נכשלה — שמירה לא תעדכן את התמונה באתר.";
      onUploadState?.({ uploading: false, filePending: true });
      setLocalError(message);
      onStatus({ type: "error", message });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        {displaySrc && !broken ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displaySrc}
            alt="תצוגה מקדימה של התמונה"
            className="mx-auto max-h-56 w-full object-contain p-2"
            onError={() => setBroken(true)}
          />
        ) : (
          <div className="flex h-40 flex-col items-center justify-center gap-1 text-sm text-brand-dark/50">
            <span>אין תצוגה מקדימה</span>
            <span className="text-xs">בחרו תמונה מהמחשב למטה</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
          dragOver
            ? "border-brand-medium bg-brand-pale"
            : "border-border bg-surface hover:border-brand-medium"
        }`}
      >
        <span className="text-sm font-bold text-brand-navy">
          {uploading ? "מעלה תמונה…" : "בחרו תמונה מהמחשב"}
        </span>
        <span className="text-xs text-brand-dark/55">
          לחצו כאן או גררו קובץ · JPG, PNG או WebP
        </span>
        {fileName ? (
          <span className="mt-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-brand-navy">
            נבחר: {fileName}
          </span>
        ) : null}
        {localError ? (
          <span className="mt-2 max-w-md text-xs font-medium text-red-700">
            {localError}
          </span>
        ) : null}
      </div>
    </div>
  );
}
