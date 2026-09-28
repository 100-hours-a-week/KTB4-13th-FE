import { useState } from "react";
import type { ReactNode } from "react";

import { AuthContext } from "@/features/auth/context/authContext";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        isAuthenticated: accessToken !== null,
        setAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
