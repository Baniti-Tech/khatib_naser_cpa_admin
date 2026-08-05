import { isApiConfigured, getApiBaseUrl } from "@/lib/cloud-run";

const CHECKS = [
  {
    key: "SHARED_SITES_API_URL",
    label: "Shared Sites API URL",
    hint: "כתובת Cloud Run של ה־API",
  },
  {
    key: "GCP_PROJECT_NUMBER",
    label: "GCP project number",
    hint: "ל־Workload Identity Federation",
  },
  {
    key: "GCP_SERVICE_ACCOUNT_EMAIL",
    label: "Caller service account",
    hint: "vercel-sites-caller@…",
  },
  {
    key: "GCP_WORKLOAD_IDENTITY_POOL_ID",
    label: "WIF pool ID",
    hint: "בדרך כלל vercel",
  },
  {
    key: "GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID",
    label: "WIF provider ID",
    hint: "בדרך כלל vercel",
  },
  {
    key: "PUBLIC_SITE_URL",
    label: "כתובת האתר הציבורי",
    hint: "לקישורי תצוגה מקדימה",
  },
];

export default function SettingsPage() {
  const rows = CHECKS.map((item) => ({
    ...item,
    configured: Boolean(process.env[item.key]),
  }));

  const apiReady = isApiConfigured();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-brand-navy">הגדרות חיבור</h1>
        <p className="mt-2 text-brand-dark/60">
          האדמין קורא ל־Cloud Run דרך Vercel OIDC → WIF. אין צורך ב־Cloud SQL או מפתחות SA ב־Vercel.
        </p>
      </header>

      <div
        className={`rounded-2xl border px-5 py-4 text-sm ${
          apiReady
            ? "border-green-200 bg-green-50 text-green-900"
            : "border-amber-200 bg-amber-50 text-amber-900"
        }`}
      >
        מצב:{" "}
        <strong>
          {apiReady
            ? `מחובר ל־API (${getApiBaseUrl()})`
            : "חסרים משתני WIF / API — מצב דמו מקומי"}
        </strong>
      </div>

      <div className="rounded-2xl border border-border bg-white shadow-sm">
        <ul className="divide-y divide-border">
          {rows.map((row) => (
            <li
              key={row.key}
              className="flex items-start justify-between gap-4 px-5 py-4"
            >
              <div>
                <p className="font-semibold text-brand-navy">{row.label}</p>
                <p className="mt-1 text-xs text-brand-dark/50" dir="ltr">
                  {row.key}
                </p>
                <p className="mt-1 text-sm text-brand-dark/60">{row.hint}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  row.configured
                    ? "bg-green-100 text-green-800"
                    : "bg-brand-pale text-brand-dark"
                }`}
              >
                {row.configured ? "מוגדר" : "חסר"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-brand-navy">צעדים הבאים</h2>
        <ol className="mt-4 list-decimal space-y-2 pr-5 text-sm text-brand-dark/75">
          <li>ודאו שמשתני ה־WIF מוגדרים בפרויקט Vercel (Production)</li>
          <li>
            צרו משתמש אדמין ב־API עם{" "}
            <code className="font-mono">npm run bootstrap:admin</code>
          </li>
          <li>התחברו כאן עם האימייל והסיסמה של האדמין</li>
          <li>פרסמו את האתר naser-cpa כשמוכנים לתוכן ציבורי</li>
        </ol>
      </section>
    </div>
  );
}
