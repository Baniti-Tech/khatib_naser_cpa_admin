import { CONTENT_SECTIONS } from "@/lib/content-schema";

const imageFields = CONTENT_SECTIONS.flatMap((section) =>
  section.fields
    .filter((f) => f.type === "image")
    .map((f) => ({
      section: section.title,
      sectionId: section.id,
      label: f.label,
      slot: f.imageSlot ?? `${section.id}.${f.key}`,
      value: Array.isArray(f.value) ? f.value[0] : f.value,
    }))
);

export default function MediaPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-brand-navy">מדיה ותמונות</h1>
        <p className="mt-2 text-brand-dark/60">
          כל סלוט תמונה באתר. ההעלאה תעבור ל-Google Cloud Storage אחרי יצירת ה-bucket.
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-surface text-right text-brand-dark/60">
            <tr>
              <th className="px-4 py-3 font-medium">מקטע</th>
              <th className="px-4 py-3 font-medium">תווית</th>
              <th className="px-4 py-3 font-medium">slot</th>
              <th className="px-4 py-3 font-medium">ערך נוכחי</th>
            </tr>
          </thead>
          <tbody>
            {imageFields.map((row) => (
              <tr key={row.slot} className="border-t border-border">
                <td className="px-4 py-3 font-medium text-brand-navy">{row.section}</td>
                <td className="px-4 py-3">{row.label}</td>
                <td className="px-4 py-3 font-mono text-xs" dir="ltr">
                  {row.slot}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-brand-dark/60" dir="ltr">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
