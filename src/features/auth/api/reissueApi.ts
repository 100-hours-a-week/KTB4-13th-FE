import { createApiUrl } from "@/common/api/apiUrl";
import { readAccessToken } from "@/features/auth/api/accessTokenResponse";

export type ReissueApiResult =
  | {
      accessToken: string;
      ok: true;
    }
  | {
      ok: false;
    };

// Uses fetch directly (not httpClient) so a 401 here can't re-trigger reissue.
export async function reissueAccessToken(): Promise<ReissueApiResult> {
  let endpoint: URL;

  try {
    endpoint = createApiUrl("/api/v1/auth/reissue");
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

  const accessToken = await readAccessToken(response);

  if (!accessToken) {
    return { ok: false };
  }

  return { accessToken, ok: true };
}
