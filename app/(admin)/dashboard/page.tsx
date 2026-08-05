import Link from "next/link";
import { StatCard } from "@/components/StatCard";
import { SimpleBarChart } from "@/components/SimpleBarChart";
import { getAnalyticsSummary } from "@/lib/db";
import { CONTENT_SECTIONS } from "@/lib/content-schema";

export default async function DashboardPage() {
  const { summary, daily } = await getAnalyticsSummary();
  const delta =
    summary.visitsYesterday === 0
      ? "—"
      : `${(((summary.visitsToday - summary.visitsYesterday) / summary.visitsYesterday) * 100).toFixed(0)}% מול אתמול`;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-brand-navy">סקירה כללית</h1>
        <p className="mt-2 text-brand-dark/60">
          ביקורים, מעורבות יומית ועריכת תוכן האתר — כרגע עם נתוני דמו עד חיבור Cloud SQL.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="ביקורים היום"
          value={summary.visitsToday}
          trend={delta}
          hint="page_visits"
        />
        <StatCard
          label="ביקורים 7 ימים"
          value={summary.visits7d}
          hint="כולל דף הבית"
        />
        <StatCard
          label="מעורבות 7 ימים"
          value={summary.engagements7d}
          hint="לחיצות / טפסים"
        />
        <StatCard
          label="וואטסאפ 7 ימים"
          value={summary.whatsapp7d}
          hint="engagement_events"
        />
      </div>

      <SimpleBarChart
        data={daily.map((d) => ({ label: d.date, value: d.visits }))}
      />

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-navy">מקטעי תוכן לעריכה</h2>
          <Link href="/content" className="text-sm font-medium text-brand-medium">
            לכל המקטעים
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CONTENT_SECTIONS.map((section) => (
            <Link
              key={section.id}
              href={`/content/${section.id}`}
              className="rounded-xl border border-border px-4 py-4 transition hover:border-brand-medium hover:bg-brand-pale/40"
            >
              <p className="font-semibold text-brand-navy">{section.title}</p>
              <p className="mt-1 text-xs text-brand-dark/55">{section.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
