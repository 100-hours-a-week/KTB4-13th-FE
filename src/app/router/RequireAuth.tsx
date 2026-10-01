import { Navigate, Outlet, useLocation } from "react-router-dom";

import { AuthInitializingState } from "@/features/auth/components/AuthInitializingState";
import { useAuth } from "@/features/auth/context/useAuth";

export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  // Wait for the app-start reissue so a restorable session is not sent to /login.
  if (status === "initializing") {
    return <AuthInitializingState />;
  }

  if (status === "unauthenticated") {
    // LoginPage keeps only same-origin paths from this value before using it after login.
    return (
      <Navigate
        replace
        state={{
          returnTo: `${location.pathname}${location.search}${location.hash}`,
        }}
        to="/login"
      />
    );
  }

  return <Outlet />;
}
