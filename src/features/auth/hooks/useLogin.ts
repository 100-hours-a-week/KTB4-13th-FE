import { useCallback, useEffect, useState } from "react";

import type { LoginFeedback, LoginStatus } from "@/features/auth/types/auth";

const feedbackDuration: Record<LoginFeedback["kind"], number> = {
  cancelled: 2_000,
  "network-error": 3_000,
  "server-error": 2_000,
};

export function useLogin() {
  const [status, setStatus] = useState<LoginStatus>("idle");
  const [feedback, setFeedback] = useState<LoginFeedback | null>(null);

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setFeedback(null);
      setStatus("idle");
    }, feedbackDuration[feedback.kind]);

    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  const beginLogin = useCallback(() => {
    setFeedback(null);

    // TODO: Connect the confirmed Kakao authentication flow here. Do not set
    // loading until the selected SDK, redirect, or API contract is available.
  }, []);

  const handleLoginCancelled = useCallback(() => {
    setStatus("cancelled");
    setFeedback({ kind: "cancelled", message: "로그인이 취소되었어요" });
  }, []);

  const handleNetworkError = useCallback(() => {
    setStatus("network-error");
    setFeedback({
      kind: "network-error",
      message: "네트워크 연결을 확인하고 다시 시도해 주세요",
    });
  }, []);

  const handleServerError = useCallback(() => {
    setStatus("server-error");
    setFeedback({
      kind: "server-error",
      message: "지금은 로그인할 수 없어요. 잠시 후 다시 시도해 주세요",
    });
  }, []);

  const handleLoginSuccess = useCallback(() => {
    // TODO: Use the confirmed response contract to distinguish returning and
    // new members, then restore the prior page or begin onboarding.
    setFeedback(null);
    setStatus("success");
  }, []);

  const dismissFeedback = useCallback(() => {
    setFeedback(null);
    setStatus("idle");
  }, []);

  return {
    beginLogin,
    dismissFeedback,
    feedback,
    handleLoginCancelled,
    handleLoginSuccess,
    handleNetworkError,
    handleServerError,
    isLoading: status === "loading",
    status,
  };
}
