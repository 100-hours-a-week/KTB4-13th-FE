import { useEffect, useState } from "react";

import { fetchOnboardingProgress } from "@/features/onboarding/api/onboardingApi";
import type { OnboardingProgressResult } from "@/features/onboarding/api/onboardingApi";

type OnboardingEntryState =
  | { kind: "loading" }
  | { kind: "ready"; path: string }
  | { kind: "error" };

function getOnboardingEntryPath(
  result: Exclude<OnboardingProgressResult, { kind: "error" }>,
) {
  return result.kind === "found" && result.progress.status === "COMPLETED"
    ? "/"
    : "/onboarding";
}

// Decides where an authenticated user lands: /onboarding until onboarding is completed, then /.
export function useOnboardingEntryPath(isEnabled: boolean) {
  const [state, setState] = useState<OnboardingEntryState>({
    kind: "loading",
  });
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    if (!isEnabled) {
      return undefined;
    }

    let isActive = true;

    void fetchOnboardingProgress().then((result) => {
      if (!isActive) {
        return;
      }

      setState(
        result.kind === "error"
          ? { kind: "error" }
          : { kind: "ready", path: getOnboardingEntryPath(result) },
      );
    });

    return () => {
      isActive = false;
    };
  }, [isEnabled, requestKey]);

  const retry = () => {
    setState({ kind: "loading" });
    setRequestKey((current) => current + 1);
  };

  return { entry: state, retry };
}
