import { createContext } from "react";

import type { AuthStatus } from "@/features/auth/types/auth";

export interface AuthContextValue {
  accessToken: string | null;
  clearAccessToken: () => void;
  setAccessToken: (accessToken: string) => void;
  status: AuthStatus;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
