import { ExternalAccountClient } from "google-auth-library";
import { getVercelOidcToken } from "@vercel/oidc";

const API_URL = process.env.SHARED_SITES_API_URL?.replace(/\/$/, "") ?? "";

export function isApiConfigured() {
  return Boolean(
    API_URL &&
      process.env.GCP_PROJECT_NUMBER &&
      process.env.GCP_SERVICE_ACCOUNT_EMAIL &&
      process.env.GCP_WORKLOAD_IDENTITY_POOL_ID &&
      process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID,
  );
}

export function getApiBaseUrl() {
  return API_URL;
}

async function getCloudRunIdToken(audience: string): Promise<string> {
  if (process.env.CLOUD_RUN_ID_TOKEN) {
    return process.env.CLOUD_RUN_ID_TOKEN;
  }

  const projectNumber = process.env.GCP_PROJECT_NUMBER!;
  const poolId = process.env.GCP_WORKLOAD_IDENTITY_POOL_ID!;
  const providerId = process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID!;
  const saEmail = process.env.GCP_SERVICE_ACCOUNT_EMAIL!;

  const authClient = ExternalAccountClient.fromJSON({
    type: "external_account",
    audience: `//iam.googleapis.com/projects/${projectNumber}/locations/global/workloadIdentityPools/${poolId}/providers/${providerId}`,
    subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
    token_url: "https://sts.googleapis.com/v1/token",
    service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${saEmail}:generateAccessToken`,
    subject_token_supplier: {
      getSubjectToken: getVercelOidcToken,
    },
  });

  if (!authClient) {
    throw new Error("Failed to create ExternalAccountClient");
  }

  const access = await authClient.getAccessToken();
  const accessToken = typeof access === "string" ? access : access?.token;
  if (!accessToken) {
    throw new Error("Failed to obtain GCP access token via WIF");
  }

  const idRes = await fetch(
    `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${saEmail}:generateIdToken`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ audience, includeEmail: true }),
    },
  );

  if (!idRes.ok) {
    const text = await idRes.text();
    throw new Error(`generateIdToken failed (${idRes.status}): ${text}`);
  }

  const data = (await idRes.json()) as { token?: string };
  if (!data.token) {
    throw new Error("generateIdToken response missing token");
  }
  return data.token;
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
  appJwt?: string,
): Promise<Response> {
  if (!API_URL) {
    throw new Error("SHARED_SITES_API_URL is not configured");
  }

  const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const idToken = await getCloudRunIdToken(API_URL);

  const headers = new Headers(init.headers);
  if (appJwt) {
    headers.set("Authorization", `Bearer ${appJwt}`);
    headers.set("X-Serverless-Authorization", `Bearer ${idToken}`);
  } else {
    headers.set("Authorization", `Bearer ${idToken}`);
  }
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(url, {
    ...init,
    headers,
    cache: "no-store",
  });
}
