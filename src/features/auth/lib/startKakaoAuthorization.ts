import { getAuthConfig } from "@/features/auth/config/authConfig";
import {
  createCodeVerifier,
  createKakaoAuthorizationUrl,
  createS256CodeChallenge,
  createSecureRandomValue,
} from "@/features/auth/lib/kakaoAuthorization";
import {
  saveKakaoLoginTransaction,
  type KakaoAuthMode,
} from "@/features/auth/storage/kakaoLoginTransaction";

export async function startKakaoAuthorization(mode: KakaoAuthMode) {
  const { kakaoRedirectUri, kakaoRestApiKey } = getAuthConfig();
  const state = createSecureRandomValue();
  const nonce = createSecureRandomValue();
  const codeVerifier = createCodeVerifier();
  const codeChallenge = await createS256CodeChallenge(codeVerifier);

  saveKakaoLoginTransaction({ codeVerifier, mode, nonce, state });
  window.location.assign(
    createKakaoAuthorizationUrl({
      clientId: kakaoRestApiKey,
      codeChallenge,
      nonce,
      redirectUri: kakaoRedirectUri,
      state,
    }),
  );
}
