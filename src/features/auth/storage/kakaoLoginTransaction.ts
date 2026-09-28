const KAKAO_LOGIN_STATE_KEY = "bookjeokbookjeok.auth.kakao.state";
const KAKAO_LOGIN_NONCE_KEY = "bookjeokbookjeok.auth.kakao.nonce";
const KAKAO_LOGIN_CODE_VERIFIER_KEY =
  "bookjeokbookjeok.auth.kakao.code-verifier";

export interface KakaoLoginTransaction {
  codeVerifier: string;
  nonce: string;
  state: string;
}

export function saveKakaoLoginTransaction({
  codeVerifier,
  nonce,
  state,
}: KakaoLoginTransaction) {
  window.sessionStorage.setItem(KAKAO_LOGIN_STATE_KEY, state);
  window.sessionStorage.setItem(KAKAO_LOGIN_NONCE_KEY, nonce);
  window.sessionStorage.setItem(
    KAKAO_LOGIN_CODE_VERIFIER_KEY,
    codeVerifier,
  );
}

export function readKakaoLoginTransaction() {
  try {
    return {
      codeVerifier: window.sessionStorage.getItem(
        KAKAO_LOGIN_CODE_VERIFIER_KEY,
      ),
      nonce: window.sessionStorage.getItem(KAKAO_LOGIN_NONCE_KEY),
      state: window.sessionStorage.getItem(KAKAO_LOGIN_STATE_KEY),
    };
  } catch {
    return { codeVerifier: null, nonce: null, state: null };
  }
}

export function clearKakaoLoginTransaction() {
  try {
    window.sessionStorage.removeItem(KAKAO_LOGIN_STATE_KEY);
    window.sessionStorage.removeItem(KAKAO_LOGIN_NONCE_KEY);
    window.sessionStorage.removeItem(KAKAO_LOGIN_CODE_VERIFIER_KEY);
  } catch {
    // The caller still needs to finish the failure flow when storage is blocked.
  }
}
