import { useSyncExternalStore } from "react";
import type { ReactNode } from "react";

import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
  subscribeAccessToken,
} from "@/features/auth/lib/accessTokenStore";
import { AuthContext } from "@/features/auth/context/authContext";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const accessToken = useSyncExternalStore(subscribeAccessToken, getAccessToken);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        clearAccessToken,
        isAuthenticated: accessToken !== null,
        setAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
