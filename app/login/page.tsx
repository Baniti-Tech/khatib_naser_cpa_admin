"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("osama.n.cpa@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const next = searchParams.get("next") || "/dashboard";
        router.push(next);
        router.refresh();
        return;
      }
      setError(
        typeof data.message === "string"
          ? data.message
          : "התחברות נכשלה — בדקו אימייל וסיסמה",
      );
    } catch {
      setError("שגיאת רשת — נסו שוב");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
    >
      <h1 className="text-2xl font-bold text-brand-navy">התחברות</h1>
      <p className="mt-2 text-sm text-brand-dark/60">
        כניסה ללוח הבקרה של האתר
      </p>

      <label className="mt-6 block text-sm font-semibold text-brand-navy">
        אימייל
        <input
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-brand-medium"
          dir="ltr"
          required
        />
      </label>

      <label className="mt-4 block text-sm font-semibold text-brand-navy">
        סיסמה
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-brand-medium"
          required
        />
      </label>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-xl bg-brand-navy py-3 font-bold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {loading ? "מתחבר…" : "כניסה"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-navy px-4">
      <Suspense fallback={<div className="text-white">טוען…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
