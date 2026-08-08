import { apiFetch, isApiConfigured } from "./cloud-run";
import { getAccessToken } from "./session";

export type Business = {
  id: string;
  slug: string;
  name: string;
  businessType: string;
  status: string;
};

export type StatisticsResponse = {
  pageViews: number;
  ctaClicks: number;
  formStarts: number;
  formSubmissions: number;
  phoneClicks: number;
  whatsappClicks: number;
  totalLeads: number;
  leadsByStatus: Array<{ status: string; count: number }>;
  eventsByDay: Array<{ day: string; count: number }>;
  leadsByDay: Array<{ day: string; count: number }>;
  mostViewedPaths: Array<{ pagePath: string | null; count: number }>;
};

export async function requireAccessToken() {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("NOT_AUTHENTICATED");
  }
  return token;
}

export async function loginWithApi(email: string, password: string) {
  const res = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      typeof data.message === "string"
        ? data.message
        : Array.isArray(data.message)
          ? data.message.join(", ")
          : "Login failed";
    throw new Error(message);
  }
  return data as {
    accessToken: string;
    refreshToken: string;
    user: { id: string; email: string; displayName: string; globalRole: string };
  };
}

export async function fetchMe() {
  const token = await requireAccessToken();
  const res = await apiFetch("/auth/me", {}, token);
  if (!res.ok) throw new Error("Failed to load profile");
  return res.json();
}

export async function listBusinesses() {
  const token = await requireAccessToken();
  const res = await apiFetch("/admin/businesses?limit=50", {}, token);
  if (!res.ok) throw new Error("Failed to list businesses");
  const data = await res.json();
  return (data.items ?? data) as Business[];
}

export async function fetchStatistics(businessId: string) {
  const token = await requireAccessToken();
  const res = await apiFetch(
    `/admin/businesses/${businessId}/statistics`,
    {},
    token,
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Statistics failed (${res.status}): ${body}`);
  }
  return (await res.json()) as StatisticsResponse;
}

export async function listSites(businessId: string) {
  const token = await requireAccessToken();
  const res = await apiFetch(
    `/admin/businesses/${businessId}/sites`,
    {},
    token,
  );
  if (!res.ok) throw new Error("Failed to list sites");
  return res.json() as Promise<
    Array<{ id: string; slug: string }> | { items: Array<{ id: string; slug: string }> }
  >;
}

export { isApiConfigured };
