import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/features/auth/context/useAuth";
import { OnboardingEntryError } from "@/features/onboarding/components/OnboardingEntryError";
import { useOnboardingEntryPath } from "@/features/onboarding/hooks/useOnboardingEntryPath";

// Sends an already signed-in user away from public entry pages based on onboarding progress.
export function RedirectAuthenticatedUser() {
  const { status } = useAuth();
  const { entry, retry } = useOnboardingEntryPath(status === "authenticated");

  if (status === "unauthenticated") {
    return <Outlet />;
  }

  if (status === "authenticated" && entry.kind === "ready") {
    return <Navigate replace to={entry.path} />;
  }

  if (status === "authenticated" && entry.kind === "error") {
    return <OnboardingEntryError onRetry={retry} />;
  }

  return null;
}
