import { apiFetch } from "./cloud-run";
import { listBusinesses, listSites, requireAccessToken } from "./api-admin";

export type SiteContext = {
  businessId: string;
  siteId: string;
  pageId: string;
};

export type CmsSection = {
  id: string;
  key: string;
  sectionType: string;
  content: Record<string, unknown>;
  sortOrder?: number;
  isEnabled?: boolean;
};

export type UploadedMedia = {
  id: string;
  originalFilename?: string;
  altText?: string | null;
  status?: string;
  createdAt?: string;
};

export async function listSiteMedia(ctx: SiteContext): Promise<UploadedMedia[]> {
  const token = await requireAccessToken();
  const res = await apiFetch(
    `/admin/businesses/${ctx.businessId}/sites/${ctx.siteId}/media`,
    {},
    token,
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`List media failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  const items = Array.isArray(data) ? data : data.items ?? [];
  return items as UploadedMedia[];
}

export async function getNaserCpaContext(): Promise<SiteContext> {
  const token = await requireAccessToken();
  const businesses = await listBusinesses();
  const business =
    businesses.find((b) => b.slug === "naser-cpa") ?? businesses[0];
  if (!business) throw new Error("No business found");

  const sitesRaw = await listSites(business.id);
  const sites = Array.isArray(sitesRaw) ? sitesRaw : sitesRaw.items ?? [];
  const site =
    sites.find((s: { slug?: string }) => s.slug === "naser-cpa") ?? sites[0];
  if (!site?.id) throw new Error("No site found");

  const pagesRes = await apiFetch(
    `/admin/businesses/${business.id}/sites/${site.id}/pages`,
    {},
    token,
  );
  if (!pagesRes.ok) throw new Error("Failed to list pages");
  const pagesData = await pagesRes.json();
  const pages = Array.isArray(pagesData) ? pagesData : pagesData.items ?? [];
  const page =
    pages.find((p: { key?: string; path?: string }) => p.key === "home" || p.path === "/") ??
    pages[0];
  if (!page?.id) throw new Error("No home page found");

  return { businessId: business.id, siteId: site.id, pageId: page.id };
}

export async function listPageSections(ctx: SiteContext): Promise<CmsSection[]> {
  const token = await requireAccessToken();
  const res = await apiFetch(
    `/admin/businesses/${ctx.businessId}/sites/${ctx.siteId}/pages/${ctx.pageId}/sections`,
    {},
    token,
  );
  if (!res.ok) throw new Error("Failed to list sections");
  const data = await res.json();
  const items = Array.isArray(data) ? data : data.items ?? [];
  return items as CmsSection[];
}

export async function getSectionByKey(ctx: SiteContext, key: string) {
  const section = (await listPageSections(ctx)).find((s) => s.key === key);
  if (!section) throw new Error(`Section not found: ${key}`);
  return section;
}

export async function createSection(
  ctx: SiteContext,
  params: {
    key: string;
    sectionType: string;
    content: Record<string, unknown>;
    sortOrder?: number;
  },
) {
  const token = await requireAccessToken();
  const res = await apiFetch(
    `/admin/businesses/${ctx.businessId}/sites/${ctx.siteId}/pages/${ctx.pageId}/sections`,
    {
      method: "POST",
      body: JSON.stringify({
        key: params.key,
        sectionType: params.sectionType,
        content: params.content,
        sortOrder: params.sortOrder ?? 0,
        isEnabled: true,
      }),
    },
    token,
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Create section failed (${res.status}): ${text}`);
  }
  return (await res.json()) as CmsSection;
}

export async function getOrCreateSection(
  ctx: SiteContext,
  params: {
    key: string;
    sectionType: string;
    content: Record<string, unknown>;
    sortOrder?: number;
  },
) {
  const existing = (await listPageSections(ctx)).find((s) => s.key === params.key);
  if (existing) return existing;
  return createSection(ctx, params);
}

function normalizeImageMime(type: string, filename: string): string {
  const mime = type.toLowerCase();
  if (mime === "image/jpg" || mime === "image/pjpeg") return "image/jpeg";
  if (mime === "image/jpeg" || mime === "image/png" || mime === "image/webp") {
    return mime;
  }
  const name = filename.toLowerCase();
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

function formatUploadError(status: number, text: string): string {
  try {
    const json = JSON.parse(text) as { message?: unknown; error?: unknown };
    const raw = json.message ?? json.error ?? text;
    const message = Array.isArray(raw) ? raw.join(", ") : String(raw);
    return `העלאה נכשלה (${status}): ${message}`;
  } catch {
    return `העלאה נכשלה (${status}): ${text.slice(0, 240)}`;
  }
}

export async function uploadSiteMedia(params: {
  file: File;
  category: string;
  altText?: string;
}): Promise<UploadedMedia> {
  const ctx = await getNaserCpaContext();
  const token = await requireAccessToken();
  const filename = params.file.name || "upload.jpg";
  const mime = normalizeImageMime(params.file.type || "", filename);
  const bytes = await params.file.arrayBuffer();
  if (bytes.byteLength === 0) {
    throw new Error("הקובץ שהתקבל ריק. בחרו את התמונה שוב.");
  }
  const uploadFile = new File([bytes], filename, { type: mime });

  const body = new FormData();
  body.append("file", uploadFile, filename);
  const query = new URLSearchParams({ category: params.category });
  if (params.altText) query.set("altText", params.altText);

  const res = await apiFetch(
    `/admin/businesses/${ctx.businessId}/sites/${ctx.siteId}/media?${query}`,
    { method: "POST", body },
    token,
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(formatUploadError(res.status, text));
  }
  return (await res.json()) as UploadedMedia;
}

export async function patchSectionContent(
  ctx: SiteContext,
  sectionId: string,
  content: Record<string, unknown>,
) {
  const token = await requireAccessToken();
  const res = await apiFetch(
    `/admin/businesses/${ctx.businessId}/sites/${ctx.siteId}/pages/${ctx.pageId}/sections/${sectionId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ content }),
    },
    token,
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Save failed (${res.status}): ${text}`);
  }
  return res.json();
}

export async function publishLiveSite(ctx: SiteContext) {
  const token = await requireAccessToken();

  const siteRes = await apiFetch(
    `/admin/businesses/${ctx.businessId}/sites/${ctx.siteId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status: "PUBLISHED" }),
    },
    token,
  );
  if (!siteRes.ok) {
    const text = await siteRes.text();
    throw new Error(`Publish site failed (${siteRes.status}): ${text}`);
  }

  const pageRes = await apiFetch(
    `/admin/businesses/${ctx.businessId}/sites/${ctx.siteId}/pages/${ctx.pageId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status: "PUBLISHED" }),
    },
    token,
  );
  if (!pageRes.ok) {
    const text = await pageRes.text();
    throw new Error(`Publish page failed (${pageRes.status}): ${text}`);
  }
}
