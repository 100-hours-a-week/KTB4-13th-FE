interface AuthConfig {
  apiBaseUrl: string;
  kakaoRedirectUri: string;
  kakaoRestApiKey: string;
}

function requireEnvironmentValue(name: string, value: string | undefined) {
  if (!value?.trim()) {
    throw new Error(`${name} 환경변수가 설정되지 않았습니다.`);
  }

  return value.trim();
}

export function getAuthConfig(): AuthConfig {
  return {
    apiBaseUrl: requireEnvironmentValue(
      "VITE_API_BASE_URL",
      import.meta.env.VITE_API_BASE_URL,
    ),
    kakaoRedirectUri: requireEnvironmentValue(
      "VITE_KAKAO_REDIRECT_URI",
      import.meta.env.VITE_KAKAO_REDIRECT_URI,
    ),
    kakaoRestApiKey: requireEnvironmentValue(
      "VITE_KAKAO_REST_API_KEY",
      import.meta.env.VITE_KAKAO_REST_API_KEY,
    ),
  };
}
