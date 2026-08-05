import { StatCard } from "@/components/StatCard";
import { SimpleBarChart } from "@/components/SimpleBarChart";
import { getAnalyticsSummary } from "@/lib/db";

export default async function AnalyticsPage() {
  const { summary, daily, topPaths } = await getAnalyticsSummary();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-brand-navy">אנליטיקה</h1>
        <p className="mt-2 text-brand-dark/60">
          ביקורים יומיים ומעורבות. אחרי חיבור האתר הציבורי, האירועים ייכתבו ל-Cloud SQL.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="ביקורים 7 ימים" value={summary.visits7d} />
        <StatCard label="מעורבות 7 ימים" value={summary.engagements7d} />
        <StatCard label="וואטסאפ 7 ימים" value={summary.whatsapp7d} />
        <StatCard label="טפסי קשר 7 ימים" value={summary.contact7d} />
      </div>

      <SimpleBarChart
        data={daily.map((d) => ({ label: d.date, value: d.visits }))}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-bold text-brand-navy">מעורבות יומית</h3>
          <ul className="space-y-2">
            {daily
              .slice(-7)
              .reverse()
              .map((d) => (
                <li
                  key={d.date}
                  className="flex items-center justify-between rounded-xl bg-surface px-3 py-2 text-sm"
                >
                  <span dir="ltr">{d.date}</span>
                  <span className="text-brand-dark/70">
                    {d.engagements} אירועים · {d.whatsappClicks} וואטסאפ
                  </span>
                </li>
              ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-bold text-brand-navy">נתיבים פופולריים</h3>
          <ul className="space-y-2">
            {topPaths.map((p) => (
              <li
                key={p.path}
                className="flex items-center justify-between rounded-xl bg-surface px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{p.label}</p>
                  <p className="text-xs text-brand-dark/45" dir="ltr">
                    {p.path}
                  </p>
                </div>
                <span className="font-bold text-brand-navy">{p.views}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
