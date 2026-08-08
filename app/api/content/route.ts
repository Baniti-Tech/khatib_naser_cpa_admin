import { NextResponse } from "next/server";
import { isApiConfigured } from "@/lib/cloud-run";
import {
  getNaserCpaContext,
  getSectionByKey,
  patchSectionContent,
} from "@/lib/cms-site";
import { saveContentField } from "@/lib/db";

function splitHeroTitle(title: string) {
  const marker = "לעסק";
  const idx = title.indexOf(marker);
  if (idx > 0) {
    return {
      headline1: title.slice(0, idx).trim(),
      headline2: title.slice(idx).trim(),
    };
  }
  return { headline1: title, headline2: "" };
}

export async function GET(request: Request) {
  const sectionId = new URL(request.url).searchParams.get("sectionId");
  if (!sectionId) {
    return NextResponse.json({ ok: false, error: "sectionId required" }, { status: 400 });
  }

  if (!isApiConfigured()) {
    return NextResponse.json({ ok: true, mode: "mock", values: null });
  }

  try {
    if (sectionId === "hero") {
      const ctx = await getNaserCpaContext();
      const section = await getSectionByKey(ctx, "hero");
      const content = section.content;
      const title = String(content.title ?? "");
      const split = splitHeroTitle(title);
      return NextResponse.json({
        ok: true,
        mode: "api",
        values: {
          headline1: split.headline1,
          headline2: split.headline2,
          subtitle: String(content.subtitle ?? ""),
          ctaPrimary: String(content.primaryButtonLabel ?? ""),
          background: String(
            content.backgroundMediaIdUrl ?? content.mediaUrl ?? "",
          ),
        },
      });
    }

    if (sectionId === "contact" || sectionId === "brand") {
      const ctx = await getNaserCpaContext();
      const section = await getSectionByKey(ctx, "contact");
      const content = section.content;
      return NextResponse.json({
        ok: true,
        mode: "api",
        values: {
          phone: String(content.phone ?? ""),
          whatsappNumber: String(content.whatsapp ?? ""),
          name: "חטיב את נאסר",
          tagline: "רואי חשבון",
          phoneDisplay: String(content.phone ?? "")
            .replace("+972", "0")
            .replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3"),
        },
      });
    }

    return NextResponse.json({
      ok: true,
      mode: "api",
      values: null,
      message: "Section editor not wired to CMS yet — use hero/contact",
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
  };

  if (!body.sectionId || !body.values) {
    return NextResponse.json(
      { ok: false, error: "sectionId and values are required" },
      { status: 400 },
    );
  }

  if (!isApiConfigured()) {
    for (const [fieldKey, value] of Object.entries(body.values)) {
      const result = await saveContentField(body.sectionId, fieldKey, value);
      if (!result.ok) {
        return NextResponse.json(result, { status: 500 });
      }
    }
    return NextResponse.json({ ok: true, mode: "mock" });
  }

  try {
    const ctx = await getNaserCpaContext();

    if (body.sectionId === "hero") {
      const section = await getSectionByKey(ctx, "hero");
      const title = [body.values.headline1, body.values.headline2]
        .filter(Boolean)
        .join(" ")
        .trim();
      await patchSectionContent(ctx, section.id, {
        ...section.content,
        title: title || String(section.content.title ?? ""),
        subtitle: body.values.subtitle ?? section.content.subtitle,
        primaryButtonLabel:
          body.values.ctaPrimary ?? section.content.primaryButtonLabel,
        primaryButtonUrl:
          section.content.primaryButtonUrl ??
          "https://khatib-naser.co.il/#contact",
      });
      return NextResponse.json({ ok: true, mode: "api" });
    }

    if (body.sectionId === "contact" || body.sectionId === "brand") {
      const section = await getSectionByKey(ctx, "contact");
      await patchSectionContent(ctx, section.id, {
        ...section.content,
        phone: body.values.phone ?? section.content.phone,
        whatsapp:
          body.values.whatsappNumber ??
          body.values.whatsapp ??
          section.content.whatsapp,
        title: section.content.title ?? "בואו נדבר",
        showLeadForm: section.content.showLeadForm ?? true,
      });
      return NextResponse.json({ ok: true, mode: "api" });
    }

    return NextResponse.json(
      {
        ok: false,
        error:
          "שמירה ל-CMS זמינה כרגע ל-Hero ולפרטי קשר בלבד. שאר המקטעים עדיין דמו.",
      },
      { status: 400 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
