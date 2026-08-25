import type { CmsSection } from "./cms-site";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

export function mediaPreviewUrl(mediaId: string) {
  return `/api/media/${mediaId}`;
}

/** Prefer explicit mediaIds, then /api/media/<uuid> in the field value. */
export function resolveMediaId(
  mediaIds: Record<string, string>,
  field: string,
  values: Record<string, string>,
  existing?: unknown,
): string | null {
  if (isUuid(mediaIds[field])) return mediaIds[field];
  const fromUrl = values[field]?.match(
    /\/(?:api\/media|public\/media)\/([0-9a-f-]{36})/i,
  )?.[1];
  if (isUuid(fromUrl)) return fromUrl;
  if (isUuid(existing)) return existing;
  return null;
}

export type DashboardSectionId =
  | "brand"
  | "hero"
  | "trust"
  | "services"
  | "whyUs"
  | "about"
  | "gallery"
  | "team"
  | "contact";

export type CmsTarget = {
  key: string;
  sectionType: string;
  sortOrder: number;
  defaultContent: Record<string, unknown>;
};

export const CMS_TARGETS: Record<DashboardSectionId, CmsTarget> = {
  brand: {
    key: "contact",
    sectionType: "CONTACT",
    sortOrder: 7,
    defaultContent: {
      title: "בואו נדבר",
      phone: "+972549843929",
      email: "",
      address: "",
      whatsapp: "972549843929",
      showLeadForm: true,
    },
  },
  hero: {
    key: "hero",
    sectionType: "HERO",
    sortOrder: 0,
    defaultContent: {
      title: "ביטחון כלכלי לעסק שלך",
      subtitle:
        "משרד רואי חשבון חטיב את נאסר ושות׳ מספק רמה אחרת של שירות — ליווי מקצועי, פתרונות טכנולוגיים מתקדמים ובסיס כלכלי יציב לצמיחה ושגשוג.",
      primaryButtonLabel: "קבלו ייעוץ חינם",
      primaryButtonUrl: "https://khatib-naser.co.il/#contact",
      backgroundMediaId: null,
    },
  },
  trust: {
    key: "stats",
    sectionType: "STATS",
    sortOrder: 1,
    defaultContent: {
      title: "במספרים",
      items: [
        { key: "experience", label: "שנות ניסיון מצטבר", value: "10+" },
        { key: "expertise", label: "שנות מומחיות בתחום", value: "30+" },
        { key: "commitment", label: "מחויבות ללקוח", value: "100%" },
        { key: "whatsapp", label: "זמינות בוואטסאפ", value: "24/7" },
      ],
    },
  },
  services: {
    key: "services",
    sectionType: "SERVICES",
    sortOrder: 2,
    defaultContent: {
      title: "השירותים שלנו",
      items: [
        {
          key: "audit",
          title: "ביקורת ועריכת דוחות כספיים",
          description:
            "הכנת דוחות כספיים מדויקים ומקצועיים בהתאם לתקנים המחמירים ביותר.",
          mediaId: null,
        },
      ],
    },
  },
  whyUs: {
    key: "why-us",
    sectionType: "CUSTOM_TEXT",
    sortOrder: 3,
    defaultContent: {
      title: "רמה אחרת של שירות",
      body: "מעל עשור של פעילות, המשרד שם לעצמו למטרה לספק ביטחון כלכלי, בסיס יציב והזדמנויות צמיחה לכל לקוח — בגישה מקצועית, אישית וחדשנית.",
    },
  },
  about: {
    key: "about",
    sectionType: "ABOUT",
    sortOrder: 4,
    defaultContent: {
      title: "שותפים לדרך של הצלחה",
      body: "",
      mediaId: null,
    },
  },
  gallery: {
    key: "gallery",
    sectionType: "GALLERY",
    sortOrder: 5,
    defaultContent: {
      title: "סביבת עבודה מקצועית ומזמינה",
      items: [],
    },
  },
  team: {
    key: "team",
    sectionType: "TEAM",
    sortOrder: 6,
    defaultContent: {
      title: "הצוות",
      members: [
        {
          key: "osama",
          name: "אוסמה נאסר",
          role: "רואה חשבון | שותף מייסד",
          bio: "",
          mediaId: null,
        },
        {
          key: "khalid",
          name: "ח'אלד חטיב",
          role: "רואה חשבון | שותף מייסד",
          bio: "",
          mediaId: null,
        },
      ],
    },
  },
  contact: {
    key: "contact",
    sectionType: "CONTACT",
    sortOrder: 7,
    defaultContent: {
      title: "בואו נדבר",
      phone: "+972549843929",
      email: "",
      address: "",
      whatsapp: "972549843929",
      showLeadForm: true,
    },
  },
};

const STAT_KEYS = ["experience", "expertise", "commitment", "whatsapp"] as const;
const GALLERY_SLOTS = [
  { field: "image1", key: "reception", caption: "אזור קבלה" },
  { field: "image2", key: "meeting", caption: "חדר ישיבות" },
  { field: "image3", key: "hallway", caption: "מרחב עבודה מקצועי" },
] as const;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

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

function imageValue(mediaId: unknown, fallback: string) {
  return isUuid(mediaId) ? mediaPreviewUrl(mediaId) : fallback;
}

export function sectionToEditor(
  sectionId: DashboardSectionId,
  section: CmsSection | null,
  fallbacks: Record<string, string>,
): { values: Record<string, string>; mediaIds: Record<string, string> } {
  const content = section?.content ?? {};
  const values: Record<string, string> = { ...fallbacks };
  const mediaIds: Record<string, string> = {};

  if (sectionId === "hero") {
    const split = splitHeroTitle(str(content.title, fallbacks.headline1));
    values.headline1 = split.headline1 || fallbacks.headline1;
    values.headline2 = split.headline2 || fallbacks.headline2;
    values.subtitle = str(content.subtitle, fallbacks.subtitle);
    values.ctaPrimary = str(content.primaryButtonLabel, fallbacks.ctaPrimary);
    if (isUuid(content.backgroundMediaId)) {
      mediaIds.background = content.backgroundMediaId;
      values.background = mediaPreviewUrl(content.backgroundMediaId);
    }
  }

  if (sectionId === "contact" || sectionId === "brand") {
    const phone = str(content.phone, fallbacks.phone);
    values.phone = phone;
    values.whatsappNumber = str(
      content.whatsapp,
      fallbacks.whatsappNumber ?? fallbacks.whatsapp,
    );
    values.title = str(content.title, fallbacks.title);
    values.phoneDisplay = phone
      .replace("+972", "0")
      .replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  }

  if (sectionId === "trust") {
    const items = asArray(content.items);
    STAT_KEYS.forEach((key, i) => {
      const row =
        items.find((item) => item.key === key) ?? items[i] ?? {};
      values[`stat${i + 1}Value`] = str(row.value, fallbacks[`stat${i + 1}Value`]);
      values[`stat${i + 1}Label`] = str(row.label, fallbacks[`stat${i + 1}Label`]);
    });
  }

  if (sectionId === "services") {
    values.title = str(content.title, fallbacks.title);
    const items = asArray(content.items);
    if (items.length > 0) {
      values.items = JSON.stringify(items, null, 2);
    }
  }

  if (sectionId === "whyUs") {
    values.title = str(content.title, fallbacks.title);
    const body = str(content.body, fallbacks.subtitle);
    values.subtitle =
      body
        .split("\n")
        .filter((line) => line && !line.startsWith("•"))
        .join(" ")
        .trim() || fallbacks.subtitle;
  }

  if (sectionId === "about") {
    values.title = str(content.title, fallbacks.title);
    const body = str(content.body, fallbacks.paragraphs);
    values.paragraphs = body.replace(/\n{3,}/g, "\n\n");
    if (isUuid(content.mediaId)) {
      mediaIds.image = content.mediaId;
      values.image = mediaPreviewUrl(content.mediaId);
    }
  }

  if (sectionId === "gallery") {
    values.title = str(content.title, fallbacks.title);
    const items = asArray(content.items);
    for (const slot of GALLERY_SLOTS) {
      const row =
        items.find((item) => item.key === slot.key) ??
        items[GALLERY_SLOTS.indexOf(slot)] ??
        {};
      if (isUuid(row.mediaId)) {
        mediaIds[slot.field] = row.mediaId;
        values[slot.field] = mediaPreviewUrl(row.mediaId);
      }
    }
  }

  if (sectionId === "team") {
    values.title = str(content.title, fallbacks.title);
    const members = asArray(content.members);
    const osama =
      members.find((m) => m.key === "osama") ?? members[0] ?? {};
    const khalid =
      members.find((m) => m.key === "khalid") ?? members[1] ?? {};
    values.osamaName = str(osama.name, fallbacks.osamaName);
    values.osamaRole = str(osama.role, fallbacks.osamaRole);
    values.osamaBio = str(osama.bio, fallbacks.osamaBio);
    values.khalidName = str(khalid.name, fallbacks.khalidName);
    values.khalidRole = str(khalid.role, fallbacks.khalidRole);
    values.khalidBio = str(khalid.bio, fallbacks.khalidBio);
    if (isUuid(osama.mediaId)) {
      mediaIds.osamaImage = osama.mediaId;
      values.osamaImage = mediaPreviewUrl(osama.mediaId);
    }
    if (isUuid(khalid.mediaId)) {
      mediaIds.khalidImage = khalid.mediaId;
      values.khalidImage = mediaPreviewUrl(khalid.mediaId);
    }
  }

  return { values, mediaIds };
}

export function editorToSectionContent(
  sectionId: DashboardSectionId,
  values: Record<string, string>,
  mediaIds: Record<string, string>,
  existing: Record<string, unknown>,
): Record<string, unknown> {
  if (sectionId === "hero") {
    const title = [values.headline1, values.headline2]
      .filter(Boolean)
      .join(" ")
      .trim();
    const backgroundMediaId = resolveMediaId(
      mediaIds,
      "background",
      values,
      existing.backgroundMediaId,
    );
    const buttonUrlRaw = str(existing.primaryButtonUrl);
    let primaryButtonUrl = "https://khatib-naser.co.il/#contact";
    try {
      if (buttonUrlRaw) {
        new URL(buttonUrlRaw);
        primaryButtonUrl = buttonUrlRaw;
      }
    } catch {
      /* keep default absolute URL — CMS requires a valid URL */
    }
    return {
      title: title || str(existing.title, "ביטחון כלכלי לעסק שלך"),
      subtitle: values.subtitle ?? existing.subtitle,
      primaryButtonLabel:
        values.ctaPrimary ?? existing.primaryButtonLabel,
      primaryButtonUrl,
      backgroundMediaId,
    };
  }

  if (sectionId === "contact" || sectionId === "brand") {
    return {
      ...existing,
      title: values.title || str(existing.title, "בואו נדבר"),
      phone: values.phone ?? existing.phone,
      whatsapp:
        values.whatsappNumber ?? values.whatsapp ?? existing.whatsapp,
      email: str(existing.email, ""),
      address: str(existing.address, ""),
      showLeadForm: existing.showLeadForm ?? true,
    };
  }

  if (sectionId === "trust") {
    return {
      title: str(existing.title, "במספרים"),
      items: STAT_KEYS.map((key, i) => ({
        key,
        value: values[`stat${i + 1}Value`] ?? "",
        label: values[`stat${i + 1}Label`] ?? "",
      })),
    };
  }

  if (sectionId === "services") {
    let parsed: unknown;
    try {
      parsed = JSON.parse(values.items || "[]");
    } catch {
      throw new Error("רשימת השירותים חייבת להיות JSON תקין");
    }
    const existingItems = asArray(existing.items);
    const items = (Array.isArray(parsed) ? parsed : []).map((item, i) => {
      const row = asRecord(item);
      const prev = existingItems[i] ?? {};
      const key =
        str(row.key) ||
        str(prev.key) ||
        `service-${i + 1}`;
      return {
        key,
        title: str(row.title),
        description: str(row.description),
        mediaId: isUuid(row.mediaId)
          ? row.mediaId
          : isUuid(prev.mediaId)
            ? prev.mediaId
            : null,
      };
    });
    if (items.length < 1) {
      throw new Error("חייבים לפחות שירות אחד");
    }
    return {
      title: values.title || str(existing.title, "השירותים שלנו"),
      items,
    };
  }

  if (sectionId === "whyUs") {
    const existingBody = str(existing.body);
    const bullets = existingBody
      .split("\n")
      .filter((line) => line.trim().startsWith("•"));
    const intro = values.subtitle?.trim() || existingBody;
    const body = bullets.length
      ? [intro, "", ...bullets].join("\n")
      : intro;
    return {
      title: values.title || str(existing.title, "רמה אחרת של שירות"),
      body,
    };
  }

  if (sectionId === "about") {
    return {
      title: values.title || str(existing.title, "שותפים לדרך של הצלחה"),
      body: values.paragraphs || str(existing.body),
      mediaId: resolveMediaId(
        mediaIds,
        "image",
        values,
        existing.mediaId,
      ),
    };
  }

  if (sectionId === "gallery") {
    const existingItems = asArray(existing.items);
    const items = GALLERY_SLOTS.map((slot) => {
      const prev =
        existingItems.find((item) => item.key === slot.key) ?? {};
      const mediaId = resolveMediaId(
        mediaIds,
        slot.field,
        values,
        prev.mediaId,
      );
      if (!mediaId) return null;
      return {
        key: slot.key,
        mediaId,
        caption: str(prev.caption, slot.caption),
      };
    }).filter((item): item is NonNullable<typeof item> => item !== null);

    if (items.length < 1) {
      throw new Error(
        "גלריה דורשת לפחות תמונה אחת שנשמרה ב-CMS. בחרו קובץ ואז שמרו.",
      );
    }

    return {
      title: values.title || str(existing.title, "סביבת עבודה מקצועית ומזמינה"),
      items,
    };
  }

  if (sectionId === "team") {
    const existingMembers = asArray(existing.members);
    const patchMember = (
      key: "osama" | "khalid",
      prefix: "osama" | "khalid",
    ) => {
      const prev =
        existingMembers.find((m) => m.key === key) ?? {};
      const imageKey = `${prefix}Image`;
      return {
        key,
        name: values[`${prefix}Name`] || str(prev.name),
        role: values[`${prefix}Role`] || str(prev.role),
        bio: values[`${prefix}Bio`] || str(prev.bio),
        mediaId: resolveMediaId(
          mediaIds,
          imageKey,
          values,
          prev.mediaId,
        ),
      };
    };
    const others = existingMembers.filter(
      (m) => m.key !== "osama" && m.key !== "khalid",
    );
    return {
      title: values.title || str(existing.title, "הצוות"),
      members: [
        patchMember("osama", "osama"),
        patchMember("khalid", "khalid"),
        ...others,
      ],
    };
  }

  throw new Error(`Unsupported section: ${sectionId}`);
}

export function isDashboardSectionId(id: string): id is DashboardSectionId {
  return id in CMS_TARGETS;
}

export function categoryFromSlot(slotKey: string): string {
  if (slotKey.startsWith("team.")) return "TEAM";
  if (slotKey.startsWith("gallery.")) return "GALLERY";
  if (slotKey.startsWith("hero.")) return "HERO";
  if (slotKey.startsWith("brand.")) return "LOGO";
  if (slotKey.startsWith("about.")) return "OTHER";
  return "OTHER";
}
