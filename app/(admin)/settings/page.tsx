const CHECKS = [
  {
    key: "DATABASE_URL",
    label: "Cloud SQL",
    hint: "מחרוזת חיבור PostgreSQL / Cloud SQL Auth Proxy",
  },
  {
    key: "GCS_BUCKET",
    label: "Cloud Storage bucket",
    hint: "שם ה-bucket לתמונות האתר",
  },
  {
    key: "GCS_PROJECT_ID",
    label: "GCP project id",
    hint: "מזהה הפרויקט ב-Google Cloud",
  },
  {
    key: "ADMIN_PASSWORD",
    label: "סיסמת אדמין",
    hint: "להחלפה באימות אמיתי לפני פרודקשן",
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

  const mockMode = process.env.USE_MOCK_DATA !== "false";

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-brand-navy">הגדרות GCP</h1>
        <p className="mt-2 text-brand-dark/60">
          סטטוס משתני סביבה. מלאו את <code className="font-mono">.env.local</code> לפי{" "}
          <code className="font-mono">.env.example</code> אחרי יצירת הפרויקט ב-GCP.
        </p>
      </header>

      <div
        className={`rounded-2xl border px-5 py-4 text-sm ${
          mockMode
            ? "border-amber-200 bg-amber-50 text-amber-900"
            : "border-green-200 bg-green-50 text-green-900"
        }`}
      >
        מצב נוכחי:{" "}
        <strong>{mockMode ? "USE_MOCK_DATA=true (דמו)" : "מחובר לנתונים אמיתיים"}</strong>
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
        <h2 className="text-lg font-bold text-brand-navy">צעדים מומלצים ב-GCP</h2>
        <ol className="mt-4 list-decimal space-y-2 pr-5 text-sm text-brand-dark/75">
          <li>יצירת Google Cloud Project</li>
          <li>Cloud SQL (PostgreSQL) + הרצת <code className="font-mono">sql/schema.sql</code></li>
          <li>Cloud Storage bucket לתמונות + הרשאות קריאה ציבוריות / CDN</li>
          <li>Service account עם הרשאות SQL + Storage</li>
          <li>הוספת משתני סביבה ב-Vercel (GitHub deploy) והעברת USE_MOCK_DATA=false</li>
        </ol>
      </section>
    </div>
  );
}
