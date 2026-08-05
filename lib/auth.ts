/**
 * Minimal placeholder auth for the template.
 * Replace with NextAuth / Clerk / Firebase Auth before production.
 */

export function isAuthConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.SESSION_SECRET);
}

export function verifyPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD ?? "admin";
  return password === expected;
}
