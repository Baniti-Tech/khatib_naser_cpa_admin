import { StatCard } from "@/components/StatCard";
import { SimpleBarChart } from "@/components/SimpleBarChart";
import { getDashboardData } from "@/lib/dashboard-data";

export default async function AnalyticsPage() {
  const { summary, daily, topPaths, source, error } = await getDashboardData();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-brand-navy">אנליטיקה</h1>
        <p className="mt-2 text-brand-dark/60">
          ביקורים ומעורבות
          {source === "api" ? " מ־shared-sites-api" : " (נתוני דמו)"}.
        </p>
        {error ? (
          <p className="mt-2 text-sm text-amber-700">{error}</p>
        ) : null}
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="ביקורים 7 ימים" value={summary.visits7d} />
        <StatCard label="מעורבות 7 ימים" value={summary.engagements7d} />
        <StatCard label="וואטסאפ" value={summary.whatsapp7d} />
        <StatCard label="טפסי קשר / לידים" value={summary.totalLeads} />
      </div>

      <SimpleBarChart
        data={daily.map((d) => ({ label: d.date, value: d.visits }))}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-bold text-brand-navy">אירועים יומיים</h3>
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
                  <span className="text-brand-dark/70">{d.visits} אירועים</span>
                </li>
              ))}
            {daily.length === 0 ? (
              <li className="text-sm text-brand-dark/50">אין נתונים עדיין</li>
            ) : null}
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
            {topPaths.length === 0 ? (
              <li className="text-sm text-brand-dark/50">אין נתונים עדיין</li>
            ) : null}
          </ul>
        </div>
      </div>
    </div>
  );
}
