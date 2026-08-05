import { NextResponse } from "next/server";
import { saveContentField } from "@/lib/db";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    sectionId?: string;
    values?: Record<string, string>;
  };

  if (!body.sectionId || !body.values) {
    return NextResponse.json(
      { ok: false, error: "sectionId and values are required" },
      { status: 400 }
    );
  }

  for (const [fieldKey, value] of Object.entries(body.values)) {
    const result = await saveContentField(body.sectionId, fieldKey, value);
    if (!result.ok) {
      return NextResponse.json(result, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, mode: "mock-or-stub" });
}
