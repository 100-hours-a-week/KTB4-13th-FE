import { Navigate, Outlet } from "react-router-dom";

import { AuthInitializingState } from "@/features/auth/components/AuthInitializingState";
import { useAuth } from "@/features/auth/context/useAuth";

export function RequireAuth() {
  const { status } = useAuth();

  // Wait for the app-start reissue so a restorable session is not sent to /login.
  if (status === "initializing") {
    return <AuthInitializingState />;
  }

  if (status === "unauthenticated") {
    return <Navigate replace to="/login" />;
  }

  return <Outlet />;
}
