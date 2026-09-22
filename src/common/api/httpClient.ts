export interface AuthHandlers {
  clearAccessToken: () => void;
  getAccessToken: () => string | null;
  reissue: () => Promise<string>;
  setAccessToken: (accessToken: string) => void;
}

export interface HttpClient {
  fetchWithAuth: (path: string, init?: RequestInit) => Promise<Response>;
}

const API_BASE_URL_ENV_KEY = "VITE_API_BASE_URL";

function getApiBaseUrl() {
  const value = import.meta.env.VITE_API_BASE_URL;

  if (!value?.trim()) {
    throw new Error(`${API_BASE_URL_ENV_KEY} 환경변수가 설정되지 않았습니다.`);
  }

  return value.trim();
}

// Injects auth capability so this client never imports auth feature code.
export function createHttpClient(authHandlers: AuthHandlers): HttpClient {
  let reissuePromise: Promise<string | null> | null = null;

  function sendRequest(
    path: string,
    init: RequestInit,
    overrideAccessToken?: string,
  ) {
    const endpoint = new URL(path, getApiBaseUrl());
    const accessToken = overrideAccessToken ?? authHandlers.getAccessToken();
    const headers = new Headers(init.headers);

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    return fetch(endpoint, {
      ...init,
      credentials: "include",
      headers,
    });
  }

  async function performReissue(): Promise<string | null> {
    try {
      const accessToken = await authHandlers.reissue();
      authHandlers.setAccessToken(accessToken);
      return accessToken;
    } catch {
      authHandlers.clearAccessToken();
      return null;
    }
  }

  function reissueAccessTokenOnce(): Promise<string | null> {
    if (!reissuePromise) {
      reissuePromise = performReissue().finally(() => {
        reissuePromise = null;
      });
    }

    return reissuePromise;
  }

  // On a 401, retries at most once after reissue; reissue itself must not call this.
  async function fetchWithAuth(
    path: string,
    init: RequestInit = {},
  ): Promise<Response> {
    const response = await sendRequest(path, init);

    if (response.status !== 401) {
      return response;
    }

    const newAccessToken = await reissueAccessTokenOnce();

    if (!newAccessToken) {
      return response;
    }

    return sendRequest(path, init, newAccessToken);
  }

  return { fetchWithAuth };
}
