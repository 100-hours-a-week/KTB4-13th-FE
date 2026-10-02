import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";

import { loginWithKakao } from "@/features/auth/api/kakaoLoginApi";
import { useAuth } from "@/features/auth/context/useAuth";
import {
  clearKakaoLoginTransaction,
  readKakaoLoginTransaction,
} from "@/features/auth/storage/kakaoLoginTransaction";
import {
  clearLoginReturnTo,
  readLoginReturnTo,
} from "@/features/auth/storage/loginReturnTo";
import { OnboardingEntryError } from "@/features/onboarding/components/OnboardingEntryError";
import { useOnboardingEntryPath } from "@/features/onboarding/hooks/useOnboardingEntryPath";

type CallbackStatus = "loading" | "success" | "error";

const callbackMessages = {
  invalid: "로그인 요청을 확인할 수 없어요. 다시 시도해 주세요",
  network: "네트워크 연결을 확인하고 다시 시도해 주세요",
  provider: "카카오 로그인이 취소되었거나 실패했어요",
  server: "지금은 로그인할 수 없어요. 잠시 후 다시 시도해 주세요",
  success: "로그인이 완료되었어요",
} as const;

function LoginRedirect({ to }: { to: string }) {
  useEffect(() => {
    clearLoginReturnTo();
  }, []);

  return <Navigate replace to={to} />;
}

export function KakaoCallbackPage() {
  const { setAccessToken } = useAuth();
  const hasProcessed = useRef(false);
  const [status, setStatus] = useState<CallbackStatus>("loading");
  const [message, setMessage] = useState("로그인 처리 중이에요");
  const [returnTo] = useState(readLoginReturnTo);
  const { entry, retry } = useOnboardingEntryPath(status === "success");

  useEffect(() => {
    if (hasProcessed.current) {
      return;
    }

    hasProcessed.current = true;

    const fail = (failureMessage: string) => {
      clearKakaoLoginTransaction();
      clearLoginReturnTo();
      setMessage(failureMessage);
      setStatus("error");
    };

    const processCallback = async () => {
      const query = new URLSearchParams(window.location.search);
      window.history.replaceState(null, "", window.location.pathname);

      if (query.has("error") || query.has("error_description")) {
        fail(callbackMessages.provider);
        return;
      }

      const authorizationCode = query.get("code");
      const returnedState = query.get("state");
      const transaction = readKakaoLoginTransaction();

      if (
        !authorizationCode ||
        !returnedState ||
        !transaction.state ||
        !transaction.codeVerifier ||
        !transaction.nonce ||
        returnedState !== transaction.state
      ) {
        fail(callbackMessages.invalid);
        return;
      }

      clearKakaoLoginTransaction();

      const result = await loginWithKakao({
        authorizationCode,
        codeVerifier: transaction.codeVerifier,
        nonce: transaction.nonce,
      });

      if (!result.ok) {
        clearLoginReturnTo();
        setMessage(
          result.reason === "network-error"
            ? callbackMessages.network
            : callbackMessages.server,
        );
        setStatus("error");
        return;
      }

      setAccessToken(result.accessToken);
      setMessage(callbackMessages.success);
      setStatus("success");
    };

    void processCallback();
  }, [setAccessToken]);

  if (status === "success" && entry.kind === "ready") {
    return (
      <LoginRedirect to={entry.path === "/" ? (returnTo ?? "/") : entry.path} />
    );
  }

  if (status === "success" && entry.kind === "error") {
    return <OnboardingEntryError onRetry={retry} />;
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface px-5 py-10">
      <div className="w-full max-w-xs">
        {status === "error" ? (
          <div
            aria-live="assertive"
            className="border-t border-error pt-4 text-center"
            role="alert"
          >
            <p className="break-keep type-body leading-relaxed text-text-primary">
              {message}
            </p>
          </div>
        ) : (
          <p
            aria-live="polite"
            className="break-keep text-center type-body leading-relaxed text-text-secondary"
            role="status"
          >
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
