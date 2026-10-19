import { createApiUrl } from "@/common/api/apiUrl";
import { parseApiResponse } from "@/common/api/apiResponse";
import type { KakaoAuthMode } from "@/features/auth/storage/kakaoLoginTransaction";

interface KakaoLoginRequest {
  authorizationCode: string;
  codeVerifier: string;
  nonce: string;
}

export type KakaoAuthApiResult =
  | {
      accessToken: string;
      ok: true;
    }
  | {
      ok: false;
      reason: "network-error" | "server-error" | "signup-required";
    };

export async function authenticateWithKakao(
  request: KakaoLoginRequest,
  mode: KakaoAuthMode,
): Promise<KakaoAuthApiResult> {
  let endpoint: URL;

  try {
    endpoint = createApiUrl(`/api/v1/auth/kakao/${mode}`);
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

  const result = await parseApiResponse(response);
  if (!result.ok) {
    if (
      mode === "login" &&
      result.status === 404 &&
      result.error?.code === "SIGNUP_REQUIRED"
    ) {
      return { ok: false, reason: "signup-required" };
    }
    return { ok: false, reason: "server-error" };
  }

  const accessToken =
    typeof result.data === "object" &&
    result.data !== null &&
    typeof Reflect.get(result.data, "accessToken") === "string"
      ? String(Reflect.get(result.data, "accessToken"))
      : null;

  if (!accessToken?.trim()) return { ok: false, reason: "server-error" };

  return { accessToken, ok: true };
}
