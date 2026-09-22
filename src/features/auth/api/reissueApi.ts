import { getAuthConfig } from "@/features/auth/config/authConfig";

export type ReissueApiResult =
  | {
      accessToken: string;
      ok: true;
    }
  | {
      ok: false;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractAccessToken(payload: unknown) {
  if (
    !isRecord(payload) ||
    payload.result !== "SUCCESS" ||
    payload.error !== null ||
    !isRecord(payload.data) ||
    typeof payload.data.accessToken !== "string" ||
    !payload.data.accessToken.trim()
  ) {
    return null;
  }

  return payload.data.accessToken;
}

// Uses fetch directly (not httpClient) so a 401 here can't re-trigger reissue.
export async function reissueAccessToken(): Promise<ReissueApiResult> {
  let endpoint: URL;

  try {
    const { apiBaseUrl } = getAuthConfig();
    endpoint = new URL("/api/v1/auth/reissue", apiBaseUrl);
  } catch {
    return { ok: false };
  }

  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    return { ok: false };
  }

  if (!response.ok) {
    return { ok: false };
  }

  try {
    const accessToken = extractAccessToken(await response.json());

    if (!accessToken) {
      return { ok: false };
    }

    return { accessToken, ok: true };
  } catch {
    return { ok: false };
  }
}
