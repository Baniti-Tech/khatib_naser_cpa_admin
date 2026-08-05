"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "סקירה כללית" },
  { href: "/analytics", label: "אנליטיקה" },
  { href: "/content", label: "ניהול תוכן" },
  { href: "/media", label: "מדיה ותמונות" },
  { href: "/settings", label: "הגדרות GCP" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-l border-border bg-brand-navy text-white">
      <div className="border-b border-white/10 px-5 py-6">
        <p className="text-xs font-medium tracking-wide text-brand-light">Baniti Admin</p>
        <h1 className="mt-1 text-lg font-bold">חטיב את נאסר</h1>
        <p className="mt-1 text-sm text-white/60">לוח בקרה לאתר</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {LINKS.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-white text-brand-navy"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4 text-xs text-white/50">
        מצב תבנית · נתוני דמו עד חיבור GCP
      </div>
    </aside>
  );
}
