import { NextResponse } from "next/server";
import { loginWithApi } from "@/lib/api-admin";
import { isApiConfigured } from "@/lib/cloud-run";
import { verifyPassword } from "@/lib/auth";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/session";

const cookieOpts = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (isApiConfigured()) {
    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: "Email and password are required" },
        { status: 400 },
      );
    }

    try {
      const data = await loginWithApi(email, password);
      const response = NextResponse.json({
        ok: true,
        user: data.user,
        mode: "api",
      });
      response.cookies.set(ACCESS_COOKIE, data.accessToken, {
        ...cookieOpts,
        maxAge: 60 * 15,
      });
      response.cookies.set(REFRESH_COOKIE, data.refreshToken, {
        ...cookieOpts,
        maxAge: 60 * 60 * 24 * 30,
      });
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      return NextResponse.json({ ok: false, message }, { status: 401 });
    }
  }

  // Local template fallback when API/WIF env is not configured
  if (!verifyPassword(password)) {
    return NextResponse.json({ ok: false, message: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, mode: "demo" });
  response.cookies.set(ACCESS_COOKIE, "demo", {
    ...cookieOpts,
    maxAge: 60 * 60 * 8,
  });
  return response;
}
