import { useEffect, useState } from "react";
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
  const [accessToken, setAccessTokenState] = useState<string | null>(
    getAccessToken,
  );

  useEffect(() => subscribeAccessToken(setAccessTokenState), []);

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
