"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/dashboard");
      return;
    }
    setError("סיסמה שגויה (תבנית — ברירת מחדל: admin)");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-navy px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
      >
        <p className="text-sm font-medium text-brand-medium">Baniti Admin</p>
        <h1 className="mt-2 text-2xl font-bold text-brand-navy">התחברות</h1>
        <p className="mt-2 text-sm text-brand-dark/60">
          תבנית התחברות בסיסית — להחלפה באימות אמיתי לפני פרודקשן.
        </p>

        <label className="mt-6 block text-sm font-semibold text-brand-navy">
          סיסמה
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-brand-medium"
            placeholder="admin"
          />
        </label>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          className="mt-6 w-full rounded-xl bg-brand-navy py-3 font-bold text-white hover:bg-brand-dark"
        >
          כניסה
        </button>
      </form>
    </div>
  );
}
