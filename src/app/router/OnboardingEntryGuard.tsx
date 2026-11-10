import { Navigate, Outlet, useLocation } from "react-router-dom";

import { AuthInitializingState } from "@/features/auth/components/AuthInitializingState";
import { useAuth } from "@/features/auth/context/useAuth";
import { OnboardingEntryError } from "@/features/onboarding/components/OnboardingEntryError";
import { useOnboardingEntryPath } from "@/features/onboarding/hooks/useOnboardingEntryPath";
import { getChatAskReturnTo } from "@/features/recommendation/lib/chatEntry";

export function OnboardingEntryGuard() {
  const { status } = useAuth();
  const location = useLocation();
  const { entry, retry } = useOnboardingEntryPath(status === "authenticated");

  if (status === "initializing") {
    return <AuthInitializingState />;
  }

  if (status === "unauthenticated") {
    return <Outlet />;
  }

  if (status === "authenticated" && entry.kind === "ready") {
    if (entry.path === "/onboarding" || location.pathname === "/login") {
      const returnTo = entry.path === "/onboarding"
        ? getChatAskReturnTo(`${location.pathname}${location.search}${location.hash}`)
        : null;
      return <Navigate replace state={returnTo ? { returnTo } : undefined} to={entry.path} />;
    }

    return <Outlet />;
  }

  if (status === "authenticated" && entry.kind === "error") {
    return <OnboardingEntryError onRetry={retry} />;
  }

  return null;
}
