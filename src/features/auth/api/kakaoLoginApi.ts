import { getAuthConfig } from "@/features/auth/config/authConfig";

interface KakaoLoginRequest {
  authorizationCode: string;
  codeVerifier: string;
  nonce: string;
}

export type KakaoLoginApiResult =
  | {
      accessToken: string;
      ok: true;
    }
  | {
      ok: false;
      reason: "network-error" | "server-error";
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

export async function loginWithKakao(
  request: KakaoLoginRequest,
): Promise<KakaoLoginApiResult> {
  let endpoint: URL;

  try {
    const { apiBaseUrl } = getAuthConfig();
    endpoint = new URL("/api/v1/auth/kakao/login", apiBaseUrl);
  } catch {
    return { ok: false, reason: "server-error" };
  }

  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
  } catch {
    return { ok: false, reason: "network-error" };
  }

  if (!response.ok) {
    return { ok: false, reason: "server-error" };
  }

  try {
    const accessToken = extractAccessToken(await response.json());

    if (!accessToken) {
      return { ok: false, reason: "server-error" };
    }

    return { accessToken, ok: true };
  } catch {
    return { ok: false, reason: "server-error" };
  }
}
