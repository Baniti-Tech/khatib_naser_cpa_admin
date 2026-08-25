import { NextResponse } from "next/server";
import { isApiConfigured } from "@/lib/cloud-run";
import { uploadSiteMedia } from "@/lib/cms-site";
import { categoryFromSlot, mediaPreviewUrl } from "@/lib/cms-map";

export const runtime = "nodejs";

function isUploadFile(value: FormDataEntryValue | null): value is File {
  if (value == null || typeof value === "string") return false;
  return typeof value.arrayBuffer === "function" && value.size > 0;
}

export async function POST(request: Request) {
  if (!isApiConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "אין חיבור ל-CMS. העלאת תמונות עובדת רק כשהאדמין מחובר ל-API האמיתי.",
      },
      { status: 503 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  const slotKey = String(form.get("slotKey") ?? "");

  if (!isUploadFile(file) || !slotKey) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "הקובץ לא הגיע לשרת. בחרו JPG, PNG או WebP ונסו שוב.",
      },
      { status: 400 },
    );
  }

  try {
    const media = await uploadSiteMedia({
      file,
      category: categoryFromSlot(slotKey),
      altText: slotKey,
    });
    const mediaId =
      media.id ??
      (media as { data?: { id?: string } }).data?.id;
    if (!mediaId) {
      return NextResponse.json(
        { ok: false, error: "ההעלאה הצליחה אבל לא התקבל מזהה מדיה" },
        { status: 500 },
      );
    }
    return NextResponse.json({
      ok: true,
      mediaId,
      publicUrl: mediaPreviewUrl(mediaId),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
