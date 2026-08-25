import { NextResponse } from "next/server";
import { isApiConfigured } from "@/lib/cloud-run";
import {
  createSection,
  getNaserCpaContext,
  listPageSections,
  patchSectionContent,
  publishLiveSite,
} from "@/lib/cms-site";
import { attachLatestUploads } from "@/lib/cms-attach";
import {
  CMS_TARGETS,
  editorToSectionContent,
  isDashboardSectionId,
  missingPhotoWarning,
  sectionToEditor,
  type DashboardSectionId,
} from "@/lib/cms-map";
import { getSection } from "@/lib/content-schema";

function fallbackValues(sectionId: string): Record<string, string> {
  const section = getSection(sectionId);
  const values: Record<string, string> = {};
  if (!section) return values;
  for (const field of section.fields) {
    values[field.key] = Array.isArray(field.value)
      ? field.value.join("\n\n")
      : field.value;
  }
  return values;
}

export async function GET(request: Request) {
  const sectionId = new URL(request.url).searchParams.get("sectionId");
  if (!sectionId) {
    return NextResponse.json(
      { ok: false, error: "sectionId required" },
      { status: 400 },
    );
  }

  const defaults = fallbackValues(sectionId);
  if (!isApiConfigured()) {
    return NextResponse.json({
      ok: true,
      mode: "disconnected",
      values: defaults,
      mediaIds: {},
    });
  }

  if (!isDashboardSectionId(sectionId)) {
    return NextResponse.json({
      ok: true,
      mode: "api",
      values: defaults,
      mediaIds: {},
    });
  }

  try {
    const ctx = await getNaserCpaContext();
    const target = CMS_TARGETS[sectionId];
    const section =
      (await listPageSections(ctx)).find((s) => s.key === target.key) ?? null;
    const mapped = sectionToEditor(sectionId, section, defaults);
    return NextResponse.json({
      ok: true,
      mode: "api",
      values: mapped.values,
      mediaIds: mapped.mediaIds,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Load failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    sectionId?: string;
    values?: Record<string, string>;
    mediaIds?: Record<string, string>;
  };

  if (!body.sectionId || !body.values) {
    return NextResponse.json(
      { ok: false, error: "sectionId and values are required" },
      { status: 400 },
    );
  }

  if (!isApiConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "אין חיבור ל-CMS. בדקו SHARED_SITES_API_URL ומשתני WIF בהגדרות Vercel.",
      },
      { status: 503 },
    );
  }

  if (!isDashboardSectionId(body.sectionId)) {
    return NextResponse.json(
      { ok: false, error: "מקטע לא מוכר" },
      { status: 400 },
    );
  }

  const sectionId: DashboardSectionId = body.sectionId;

  try {
    const ctx = await getNaserCpaContext();
    const target = CMS_TARGETS[sectionId];
    const existing =
      (await listPageSections(ctx)).find((s) => s.key === target.key) ?? null;
    const content = await attachLatestUploads(
      ctx,
      sectionId,
      editorToSectionContent(
        sectionId,
        body.values,
        body.mediaIds ?? {},
        existing?.content ?? target.defaultContent,
      ),
    );

    if (existing) {
      await patchSectionContent(ctx, existing.id, content);
    } else {
      await createSection(ctx, {
        key: target.key,
        sectionType: target.sectionType,
        content,
        sortOrder: target.sortOrder,
      });
    }
    await publishLiveSite(ctx);
    const warning = missingPhotoWarning(
      sectionId,
      content,
      body.mediaIds ?? {},
    );
    return NextResponse.json({
      ok: true,
      mode: "api",
      warning: warning ?? undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
