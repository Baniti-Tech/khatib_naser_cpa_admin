import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/storage";

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  const slotKey = String(form.get("slotKey") ?? "");

  if (!(file instanceof File) || !slotKey) {
    return NextResponse.json(
      { ok: false, error: "file and slotKey are required" },
      { status: 400 }
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const result = await uploadImage({
    slotKey,
    fileName: file.name,
    contentType: file.type || "application/octet-stream",
    bytes,
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result);
}
