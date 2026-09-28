import { createApiUrl } from "@/common/api/apiUrl";

export interface AuthHandlers {
  clearAccessToken: () => void;
  getAccessToken: () => string | null;
  reissue: () => Promise<string>;
  setAccessToken: (accessToken: string) => void;
}

export interface HttpClient {
  fetchWithAuth: (path: string, init?: RequestInit) => Promise<Response>;
  reissueAccessTokenOnce: () => Promise<string | null>;
}

// Injects auth capability so this client never imports auth feature code.
export function createHttpClient(authHandlers: AuthHandlers): HttpClient {
  let reissuePromise: Promise<string | null> | null = null;

  function sendRequest(
    path: string,
    init: RequestInit,
    accessToken: string | null,
  ) {
    const headers = new Headers(init.headers);

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    return fetch(createApiUrl(path), {
      ...init,
      credentials: "include",
      headers,
    });
  }

  async function performReissue(): Promise<string | null> {
    const accessTokenBeforeReissue = authHandlers.getAccessToken();
    let reissuedAccessToken: string | null;

    try {
      reissuedAccessToken = await authHandlers.reissue();
    } catch {
      reissuedAccessToken = null;
    }

    // A login or logout that finished during this reissue is newer, so keep its result.
    const currentAccessToken = authHandlers.getAccessToken();

    if (currentAccessToken !== accessTokenBeforeReissue) {
      return currentAccessToken;
    }

    if (reissuedAccessToken) {
      authHandlers.setAccessToken(reissuedAccessToken);
    } else {
      authHandlers.clearAccessToken();
    }

    return reissuedAccessToken;
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
    const requestAccessToken = authHandlers.getAccessToken();
    const response = await sendRequest(path, init, requestAccessToken);

    if (response.status !== 401) {
      return response;
    }

    // A concurrent request may have finished reissuing while this one was in flight.
    const currentAccessToken = authHandlers.getAccessToken();
    const newAccessToken =
      currentAccessToken && currentAccessToken !== requestAccessToken
        ? currentAccessToken
        : await reissueAccessTokenOnce();

    if (!newAccessToken) {
      return response;
    }

    return sendRequest(path, init, newAccessToken);
  }

  return { fetchWithAuth, reissueAccessTokenOnce };
}
