import { Navigate, Outlet, useLocation } from "react-router-dom";

import { AuthInitializingState } from "@/features/auth/components/AuthInitializingState";
import { useAuth } from "@/features/auth/context/useAuth";
import { OnboardingEntryError } from "@/features/onboarding/components/OnboardingEntryError";
import { useOnboardingEntryPath } from "@/features/onboarding/hooks/useOnboardingEntryPath";

export function OnboardingEntryGuard() {
  const { status } = useAuth();
  const location = useLocation();
  const { entry, retry } = useOnboardingEntryPath(status === "authenticated");

  if (status === "initializing") {
    return <AuthInitializingState />;
  }

  if (status === "unauthenticated") {
    if (location.pathname === "/") {
      return <Navigate replace state={{ returnTo: "/" }} to="/login" />;
    }

    return <Outlet />;
  }

  if (status === "authenticated" && entry.kind === "ready") {
    if (entry.path === "/onboarding" || location.pathname === "/login") {
      return <Navigate replace to={entry.path} />;
    }

    return <Outlet />;
  }

  if (status === "authenticated" && entry.kind === "error") {
    return <OnboardingEntryError onRetry={retry} />;
  }

  return null;
}
