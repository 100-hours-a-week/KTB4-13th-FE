import { createHttpClient } from "@/common/api/httpClient";
import { reissueAccessToken } from "@/features/auth/api/reissueApi";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "@/features/auth/lib/accessTokenStore";

async function reissue() {
  const result = await reissueAccessToken();

  if (!result.ok) {
    throw new Error("Access Token 재발급에 실패했습니다.");
  }

  return result.accessToken;
}

const authHttpClient = createHttpClient({
  clearAccessToken,
  getAccessToken,
  reissue,
  setAccessToken,
});

export const { fetchWithAuth } = authHttpClient;
