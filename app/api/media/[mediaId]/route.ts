import { apiFetch, getApiBaseUrl } from "@/lib/cloud-run";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ mediaId: string }> },
) {
  if (!getApiBaseUrl()) {
    return new Response("SHARED_SITES_API_URL is not configured", { status: 503 });
  }

  const { mediaId } = await context.params;
  if (!mediaId) {
    return new Response("Missing media id", { status: 400 });
  }

  try {
    const res = await apiFetch(`/public/media/${mediaId}`);
    if (!res.ok) {
      return new Response(`Media fetch failed (${res.status})`, {
        status: res.status,
      });
    }

    const contentType =
      res.headers.get("content-type") ?? "application/octet-stream";
    const cacheControl =
      res.headers.get("cache-control") ?? "public, max-age=3600";
    const body = await res.arrayBuffer();

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": cacheControl,
      },
    });
  } catch (err) {
    console.error("[api/media]", err);
    return new Response("Media proxy error", { status: 502 });
  }
}
