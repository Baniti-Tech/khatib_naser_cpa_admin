export type DailyPoint = {
  date: string;
  visits: number;
  engagements: number;
  whatsappClicks: number;
  contactSubmits: number;
};

function buildLastNDays(n: number): DailyPoint[] {
  const points: DailyPoint[] = [];
  const now = new Date();

  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const seed = (d.getDate() * 17 + d.getMonth() * 3) % 40;
    const visits = 40 + seed + (i % 5) * 8;
    const whatsappClicks = Math.round(visits * 0.12);
    const contactSubmits = Math.round(visits * 0.04);
    points.push({
      date: d.toISOString().slice(0, 10),
      visits,
      engagements: whatsappClicks + contactSubmits + Math.round(visits * 0.08),
      whatsappClicks,
      contactSubmits,
    });
  }

  return points;
}

export const MOCK_DAILY = buildLastNDays(14);

export const MOCK_SUMMARY = {
  visitsToday: MOCK_DAILY[MOCK_DAILY.length - 1]?.visits ?? 0,
  visitsYesterday: MOCK_DAILY[MOCK_DAILY.length - 2]?.visits ?? 0,
  visits7d: MOCK_DAILY.slice(-7).reduce((sum, d) => sum + d.visits, 0),
  engagements7d: MOCK_DAILY.slice(-7).reduce((sum, d) => sum + d.engagements, 0),
  whatsapp7d: MOCK_DAILY.slice(-7).reduce((sum, d) => sum + d.whatsappClicks, 0),
  contact7d: MOCK_DAILY.slice(-7).reduce((sum, d) => sum + d.contactSubmits, 0),
};

export const MOCK_TOP_PATHS = [
  { path: "/", views: 1284, label: "דף הבית" },
  { path: "/#services", views: 412, label: "שירותים" },
  { path: "/#contact", views: 287, label: "צור קשר" },
  { path: "/#team", views: 196, label: "הצוות" },
];
