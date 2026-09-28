import { createApiUrl } from "@/common/api/apiUrl";
import { readAccessToken } from "@/features/auth/api/accessTokenResponse";

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

export async function loginWithKakao(
  request: KakaoLoginRequest,
): Promise<KakaoLoginApiResult> {
  let endpoint: URL;

  try {
    endpoint = createApiUrl("/api/v1/auth/kakao/login");
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

  const accessToken = await readAccessToken(response);

  if (!accessToken) {
    return { ok: false, reason: "server-error" };
  }

  return { accessToken, ok: true };
}
