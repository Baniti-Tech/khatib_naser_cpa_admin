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

function mapStats(stats: StatisticsResponse): Omit<DashboardView, "source" | "businessName" | "error"> {
  const byDay = new Map(stats.eventsByDay.map((d) => [d.day, d.count]));
  const days = [...byDay.keys()].sort();
  const last7 = days.slice(-7);
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const visits7d = last7.reduce((sum, d) => sum + (byDay.get(d) ?? 0), 0);
  const engagements7d =
    stats.ctaClicks +
    stats.formStarts +
    stats.formSubmissions +
    stats.phoneClicks +
    stats.whatsappClicks;

  return {
    summary: {
      visitsToday: byDay.get(today) ?? 0,
      visitsYesterday: byDay.get(yesterday) ?? 0,
      visits7d: visits7d || stats.pageViews,
      engagements7d,
      whatsapp7d: stats.whatsappClicks,
      contact7d: stats.formSubmissions,
      totalLeads: stats.totalLeads,
    },
    daily: (days.length ? days : [today]).map((date) => ({
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
