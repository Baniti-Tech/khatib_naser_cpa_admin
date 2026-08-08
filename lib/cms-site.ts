import { apiFetch } from "./cloud-run";
import { listBusinesses, listSites, requireAccessToken } from "./api-admin";

export type SiteContext = {
  businessId: string;
  siteId: string;
  pageId: string;
};

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

export async function getSectionByKey(ctx: SiteContext, key: string) {
  const token = await requireAccessToken();
  const res = await apiFetch(
    `/admin/businesses/${ctx.businessId}/sites/${ctx.siteId}/pages/${ctx.pageId}/sections`,
    {},
    token,
  );
  if (!res.ok) throw new Error("Failed to list sections");
  const data = await res.json();
  const items = Array.isArray(data) ? data : data.items ?? [];
  const section = items.find((s: { key?: string }) => s.key === key);
  if (!section) throw new Error(`Section not found: ${key}`);
  return section as {
    id: string;
    key: string;
    sectionType: string;
    content: Record<string, unknown>;
  };
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
