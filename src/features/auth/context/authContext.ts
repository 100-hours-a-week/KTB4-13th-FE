import { createContext } from "react";

export interface AuthContextValue {
  accessToken: string | null;
  isAuthenticated: boolean;
  setAccessToken: (accessToken: string) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
