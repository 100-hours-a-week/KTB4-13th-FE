import { useEffect, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
  subscribeAccessToken,
} from "@/features/auth/lib/accessTokenStore";
import { reissueAccessTokenOnce } from "@/features/auth/lib/httpClient";
import { AuthContext } from "@/features/auth/context/authContext";
import type { AuthStatus } from "@/features/auth/types/auth";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const accessToken = useSyncExternalStore(subscribeAccessToken, getAccessToken);
  const [isInitialized, setIsInitialized] = useState(false);

  // Restores the session from the refresh cookie once per app start. The client's
  // single-flight reissue lets StrictMode's second effect run share the same request.
  // Any failure (401, 5xx, network) resolves to unauthenticated without retrying; the
  // refresh cookie is untouched, so a reload or a new login recovers the session.
  useEffect(() => {
    let isActive = true;

    void reissueAccessTokenOnce().then(() => {
      if (isActive) {
        setIsInitialized(true);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  let status: AuthStatus = "initializing";

  if (isInitialized) {
    status = accessToken ? "authenticated" : "unauthenticated";
  }

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        clearAccessToken,
        setAccessToken,
        status,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
