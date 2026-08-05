import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { password?: string };
  const password = body.password ?? "";

  if (!verifyPassword(password)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  // Placeholder cookie only — replace with real session signing later.
  response.cookies.set("khatib_admin_session", "demo", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return response;
}
