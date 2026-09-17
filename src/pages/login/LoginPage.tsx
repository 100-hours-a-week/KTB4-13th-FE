import { useNavigate } from "react-router-dom";

import { Toast } from "@/common/components/Toast";
import { KakaoLoginButton } from "@/features/auth/components/KakaoLoginButton";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { LoginBrand } from "@/pages/login/components/LoginBrand";

export function LoginPage() {
  const navigate = useNavigate();
  const { beginLogin, feedback, handleLoginCancelled, isLoading } = useLogin();

  const handleClose = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    handleLoginCancelled();
  };

  return (
    <main className="relative flex min-h-dvh flex-col bg-surface">
      <header className="flex justify-end px-5 pt-4">
        <button
          aria-label="로그인 화면 닫기"
          className="-mr-2 inline-flex size-11 items-center justify-center text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={handleClose}
          type="button"
        >
          <span aria-hidden="true" className="text-2xl leading-none">
            ×
          </span>
        </button>
      </header>

      {feedback ? (
        <div className="absolute inset-x-5 top-16 z-10">
          <Toast
            action={
              feedback.kind === "network-error" ? (
                <button
                  className="shrink-0 font-semibold text-accent underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  onClick={beginLogin}
                  type="button"
                >
                  다시 시도
                </button>
              ) : undefined
            }
            variant={feedback.kind === "cancelled" ? "default" : "error"}
          >
            {feedback.message}
          </Toast>
        </div>
      ) : null}

      <section className="flex flex-1 items-center justify-center px-5 py-10">
        <LoginBrand />
      </section>

      <footer className="safe-area-bottom shrink-0 px-5 pt-6">
        <KakaoLoginButton
          className="w-full"
          isLoading={isLoading}
          onClick={beginLogin}
        />
        <p className="mx-auto mt-4 max-w-xs text-center type-caption text-text-tertiary">
          계속 진행 시 이용약관 및 개인정보 처리방침에 동의하는 것으로
          간주합니다.
        </p>
      </footer>
    </main>
  );
}
