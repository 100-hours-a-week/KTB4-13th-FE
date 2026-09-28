const KAKAO_AUTHORIZATION_ENDPOINT = "https://kauth.kakao.com/oauth/authorize";
const RANDOM_VALUE_BYTE_LENGTH = 32;

interface KakaoAuthorizationUrlParameters {
  clientId: string;
  codeChallenge: string;
  nonce: string;
  redirectUri: string;
  state: string;
}

function encodeBase64Url(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return window
    .btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

export function createSecureRandomValue() {
  const bytes = new Uint8Array(RANDOM_VALUE_BYTE_LENGTH);
  window.crypto.getRandomValues(bytes);
  return encodeBase64Url(bytes);
}

export function createCodeVerifier() {
  return createSecureRandomValue();
}

export async function createS256CodeChallenge(codeVerifier: string) {
  const verifierBytes = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", verifierBytes);
  return encodeBase64Url(new Uint8Array(digest));
}

export function createKakaoAuthorizationUrl({
  clientId,
  codeChallenge,
  nonce,
  redirectUri,
  state,
}: KakaoAuthorizationUrlParameters) {
  const url = new URL(KAKAO_AUTHORIZATION_ENDPOINT);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}
