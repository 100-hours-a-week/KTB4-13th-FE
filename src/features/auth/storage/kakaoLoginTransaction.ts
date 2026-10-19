const KAKAO_LOGIN_STATE_KEY = "bookjeokbookjeok.auth.kakao.state";
const KAKAO_LOGIN_NONCE_KEY = "bookjeokbookjeok.auth.kakao.nonce";
const KAKAO_LOGIN_CODE_VERIFIER_KEY =
  "bookjeokbookjeok.auth.kakao.code-verifier";
const KAKAO_AUTH_MODE_KEY = "bookjeokbookjeok.auth.kakao.mode";

export type KakaoAuthMode = "login" | "signup";

export interface KakaoLoginTransaction {
  codeVerifier: string;
  mode: KakaoAuthMode;
  nonce: string;
  state: string;
}

export function saveKakaoLoginTransaction({
  codeVerifier,
  mode,
  nonce,
  state,
}: KakaoLoginTransaction) {
  window.sessionStorage.setItem(KAKAO_LOGIN_STATE_KEY, state);
  window.sessionStorage.setItem(KAKAO_LOGIN_NONCE_KEY, nonce);
  window.sessionStorage.setItem(
    KAKAO_LOGIN_CODE_VERIFIER_KEY,
    codeVerifier,
  );
  window.sessionStorage.setItem(KAKAO_AUTH_MODE_KEY, mode);
}

export function readKakaoLoginTransaction() {
  try {
    return {
      codeVerifier: window.sessionStorage.getItem(
        KAKAO_LOGIN_CODE_VERIFIER_KEY,
      ),
      mode:
        window.sessionStorage.getItem(KAKAO_AUTH_MODE_KEY) === "signup"
          ? "signup" as const
          : "login" as const,
      nonce: window.sessionStorage.getItem(KAKAO_LOGIN_NONCE_KEY),
      state: window.sessionStorage.getItem(KAKAO_LOGIN_STATE_KEY),
    };
  } catch {
    return { codeVerifier: null, mode: "login" as const, nonce: null, state: null };
  }
}

export function clearKakaoLoginTransaction() {
  try {
    window.sessionStorage.removeItem(KAKAO_LOGIN_STATE_KEY);
    window.sessionStorage.removeItem(KAKAO_LOGIN_NONCE_KEY);
    window.sessionStorage.removeItem(KAKAO_LOGIN_CODE_VERIFIER_KEY);
    window.sessionStorage.removeItem(KAKAO_AUTH_MODE_KEY);
  } catch {
    // The caller still needs to finish the failure flow when storage is blocked.
  }
}
