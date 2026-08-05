/**
 * Cloud SQL access stub.
 * Replace the mock branch with a real `pg` / Prisma client once GCP is ready.
 */

import { CONTENT_SECTIONS, type ContentSection } from "./content-schema";

const useMock = process.env.USE_MOCK_DATA !== "false";

export async function getContentSections(): Promise<ContentSection[]> {
  if (useMock || !process.env.DATABASE_URL) {
    return CONTENT_SECTIONS;
  }

  // TODO: SELECT section, field_key, value_text, value_json FROM site_content
  // and hydrate CONTENT_SECTIONS with DB values.
  throw new Error("Cloud SQL not configured yet. Set USE_MOCK_DATA=true or wire lib/db.ts.");
}

export async function saveContentField(
  section: string,
  fieldKey: string,
  value: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (useMock || !process.env.DATABASE_URL) {
    console.info("[mock db] saveContentField", { section, fieldKey, value });
    return { ok: true };
  }

  // TODO: UPSERT into site_content
  return { ok: false, error: "Cloud SQL not configured yet." };
}

export async function getAnalyticsSummary() {
  if (useMock || !process.env.DATABASE_URL) {
    const { MOCK_SUMMARY, MOCK_DAILY, MOCK_TOP_PATHS } = await import("./mock-analytics");
    return { summary: MOCK_SUMMARY, daily: MOCK_DAILY, topPaths: MOCK_TOP_PATHS };
  }

  // TODO: query daily_stats / page_visits / engagement_events
  throw new Error("Cloud SQL not configured yet.");
}
