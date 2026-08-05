import Link from "next/link";
import { CONTENT_SECTIONS } from "@/lib/content-schema";

export default function ContentIndexPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-brand-navy">ניהול תוכן</h1>
        <p className="mt-2 text-brand-dark/60">
          כל מקטע תואם לקומפוננטה באתר הציבורי. אחרי GCP, השמירה תלך ל-Cloud SQL והתמונות ל-GCS.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {CONTENT_SECTIONS.map((section) => (
          <Link
            key={section.id}
            href={`/content/${section.id}`}
            className="rounded-2xl border border-border bg-white p-6 shadow-sm transition hover:border-brand-medium hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-brand-navy">{section.title}</h2>
                <p className="mt-2 text-sm text-brand-dark/60">{section.description}</p>
              </div>
              <span className="rounded-full bg-brand-pale px-3 py-1 text-xs font-semibold text-brand-dark">
                {section.fields.length} שדות
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
