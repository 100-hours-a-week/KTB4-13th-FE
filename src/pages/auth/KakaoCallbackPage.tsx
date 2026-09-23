import { useEffect, useRef, useState } from "react";

import { Toast } from "@/common/components/Toast";
import { loginWithKakao } from "@/features/auth/api/kakaoLoginApi";
import { useAuth } from "@/features/auth/context/useAuth";
import {
  clearKakaoLoginTransaction,
  readKakaoLoginTransaction,
} from "@/features/auth/storage/kakaoLoginTransaction";

type CallbackStatus = "loading" | "success" | "error";

const callbackMessages = {
  invalid: "로그인 요청을 확인할 수 없어요. 다시 시도해 주세요",
  network: "네트워크 연결을 확인하고 다시 시도해 주세요",
  provider: "카카오 로그인이 취소되었거나 실패했어요",
  server: "지금은 로그인할 수 없어요. 잠시 후 다시 시도해 주세요",
  success: "로그인이 완료되었어요",
} as const;

export function KakaoCallbackPage() {
  const { setAccessToken } = useAuth();
  const hasProcessed = useRef(false);
  const [status, setStatus] = useState<CallbackStatus>("loading");
  const [message, setMessage] = useState("로그인 처리 중이에요");

  useEffect(() => {
    if (hasProcessed.current) {
      return;
    }

    hasProcessed.current = true;

    const fail = (failureMessage: string) => {
      clearKakaoLoginTransaction();
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

  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface px-5 py-10">
      <div className="w-full max-w-sm">
        {status === "error" ? (
          <Toast variant="error">{message}</Toast>
        ) : (
          <p
            aria-live="polite"
            className="text-center type-body text-text-secondary"
            role="status"
          >
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
