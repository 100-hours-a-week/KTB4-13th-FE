const API_BASE_URL_ENV_KEY = "VITE_API_BASE_URL";

function getApiBaseUrl() {
  const value = import.meta.env.VITE_API_BASE_URL;

  if (!value?.trim()) {
    throw new Error(`${API_BASE_URL_ENV_KEY} 환경변수가 설정되지 않았습니다.`);
  }

  return value.trim();
}

export function createApiUrl(path: string) {
  return new URL(path, getApiBaseUrl());
}
