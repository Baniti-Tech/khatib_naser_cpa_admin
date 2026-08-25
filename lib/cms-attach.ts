import type { DashboardSectionId } from "./cms-map";
import { isUuid } from "./cms-map";
import { listSiteMedia, type SiteContext } from "./cms-site";

function latestIdForAlt(
  media: Array<{ id: string; altText?: string | null; status?: string }>,
  altText: string,
): string | null {
  const match = media.find(
    (row) =>
      row.altText === altText &&
      row.status !== "ARCHIVED" &&
      isUuid(row.id),
  );
  return match?.id ?? null;
}

/** If the editor did not send a media id, use the latest upload for that slot. */
export async function attachLatestUploads(
  ctx: SiteContext,
  sectionId: DashboardSectionId,
  content: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  if (
    sectionId !== "team" &&
    sectionId !== "about" &&
    sectionId !== "hero" &&
    sectionId !== "gallery"
  ) {
    return content;
  }

  const media = await listSiteMedia(ctx);

  if (sectionId === "team") {
    const members = Array.isArray(content.members)
      ? (content.members as Record<string, unknown>[])
      : [];
    return {
      ...content,
      members: members.map((member) => {
        if (isUuid(member.mediaId)) return member;
        const slot =
          member.key === "khalid"
            ? "team.khalid"
            : member.key === "osama"
              ? "team.osama"
              : null;
        if (!slot) return member;
        const mediaId = latestIdForAlt(media, slot);
        return mediaId ? { ...member, mediaId } : member;
      }),
    };
  }

  if (sectionId === "about" && !isUuid(content.mediaId)) {
    const mediaId = latestIdForAlt(media, "about.image");
    return mediaId ? { ...content, mediaId } : content;
  }

  if (sectionId === "hero" && !isUuid(content.backgroundMediaId)) {
    const mediaId = latestIdForAlt(media, "hero.background");
    return mediaId ? { ...content, backgroundMediaId: mediaId } : content;
  }

  if (sectionId === "gallery") {
    const items = Array.isArray(content.items)
      ? (content.items as Record<string, unknown>[])
      : [];
    return {
      ...content,
      items: items.map((item) => {
        if (isUuid(item.mediaId)) return item;
        const slot =
          typeof item.key === "string" ? `gallery.${item.key}` : null;
        if (!slot) return item;
        const mediaId = latestIdForAlt(media, slot);
        return mediaId ? { ...item, mediaId } : item;
      }),
    };
  }

  return content;
}
