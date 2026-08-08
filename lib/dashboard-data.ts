import {
  fetchStatistics,
  isApiConfigured,
  listBusinesses,
  type StatisticsResponse,
} from "./api-admin";
import { getAccessToken } from "./session";

export type DashboardView = {
  source: "api" | "mock";
  businessName?: string;
  summary: {
    visitsToday: number;
    visitsYesterday: number;
    visits7d: number;
    engagements7d: number;
    whatsapp7d: number;
    contact7d: number;
    totalLeads: number;
  };
  daily: Array<{
    date: string;
    visits: number;
    engagements: number;
    whatsappClicks: number;
  }>;
  topPaths: Array<{ path: string; label: string; views: number }>;
  error?: string;
};

function utcDayString(offsetDays = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function lastNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => utcDayString(-(n - 1 - i)));
}

function mapStats(stats: StatisticsResponse): Omit<DashboardView, "source" | "businessName" | "error"> {
  // API buckets by UTC day (same as toISOString().slice(0, 10))
  const byDay = new Map(
    stats.eventsByDay.map((d) => [String(d.day).slice(0, 10), Number(d.count) || 0]),
  );
  // Always include API days so chart never drops real buckets (timezone / clock skew)
  const days14 = [
    ...new Set([...lastNDays(14), ...byDay.keys()]),
  ].sort();
  const days7 = lastNDays(7);
  const today = utcDayString(0);
  const yesterday = utcDayString(-1);
  const latestApiDay = [...byDay.keys()].sort().at(-1);

  const sumDays = (days: string[]) =>
    days.reduce((sum, d) => sum + (byDay.get(d) ?? 0), 0);

  const visitsFromBuckets = sumDays(days7);
  const visits7d = visitsFromBuckets > 0 ? visitsFromBuckets : stats.pageViews;
  const todayFromBuckets =
    byDay.get(today) ??
    (latestApiDay !== undefined ? byDay.get(latestApiDay) : undefined);
  const visitsToday =
    todayFromBuckets !== undefined && todayFromBuckets > 0
      ? todayFromBuckets
      : stats.pageViews;

  const engagements7d =
    stats.ctaClicks +
    stats.formStarts +
    stats.formSubmissions +
    stats.phoneClicks +
    stats.whatsappClicks;

  return {
    summary: {
      visitsToday,
      visitsYesterday: byDay.get(yesterday) ?? 0,
      visits7d,
      engagements7d,
      whatsapp7d: stats.whatsappClicks,
      contact7d: stats.formSubmissions,
      totalLeads: stats.totalLeads,
    },
    daily: days14.map((date) => ({
      date,
      visits: byDay.get(date) ?? 0,
      engagements: byDay.get(date) ?? 0,
      whatsappClicks: 0,
    })),
    topPaths: stats.mostViewedPaths.map((p) => ({
      path: p.pagePath ?? "/",
      label: p.pagePath ?? "דף הבית",
      views: p.count,
    })),
  };
}

export async function getDashboardData(): Promise<DashboardView> {
  const hasSession = Boolean(await getAccessToken());

  if (isApiConfigured() && hasSession) {
    try {
      const businesses = await listBusinesses();
      const business =
        businesses.find((b) => b.slug === "naser-cpa") ?? businesses[0];
      if (!business) {
        return {
          source: "api",
          summary: {
            visitsToday: 0,
            visitsYesterday: 0,
            visits7d: 0,
            engagements7d: 0,
            whatsapp7d: 0,
            contact7d: 0,
            totalLeads: 0,
          },
          daily: [],
          topPaths: [],
          error: "No businesses found for this account",
        };
      }
      const stats = await fetchStatistics(business.id);
      return {
        source: "api",
        businessName: business.name,
        ...mapStats(stats),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "API error";
      if (message === "NOT_AUTHENTICATED") {
        // fall through to mock for unauthenticated preview
      } else {
        const mock = await getMockDashboard();
        return { ...mock, error: message };
      }
    }
  }

  return getMockDashboard();
}

async function getMockDashboard(): Promise<DashboardView> {
  const { MOCK_SUMMARY, MOCK_DAILY, MOCK_TOP_PATHS } = await import(
    "./mock-analytics"
  );
  return {
    source: "mock",
    summary: {
      ...MOCK_SUMMARY,
      totalLeads: MOCK_SUMMARY.contact7d,
    },
    daily: MOCK_DAILY,
    topPaths: MOCK_TOP_PATHS,
  };
}
