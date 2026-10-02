import { useEffect, useId, useRef } from "react";

import { KakaoLoginButton } from "@/features/auth/components/KakaoLoginButton";
import { useLogin } from "@/features/auth/hooks/useLogin";

interface LoginRequiredDialogProps {
  description: string;
  isOpen: boolean;
  onClose: () => void;
  returnTo: string;
  title: string;
}

export function LoginRequiredDialog({
  description,
  isOpen,
  onClose,
  returnTo,
  title,
}: LoginRequiredDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const { beginLogin, feedback, isLoading } = useLogin();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (isOpen && !dialog.open) {
      triggerRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      const focusTarget = triggerRef.current;
      dialog.close();
      triggerRef.current = null;
      window.requestAnimationFrame(() => focusTarget?.focus());
    }
  }, [isOpen]);

  return (
    <dialog
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-x-0 bottom-0 top-auto m-0 w-full max-w-none rounded-t-panel border-0 bg-surface p-0 text-text-primary backdrop:bg-black/40 lg:left-1/2 lg:right-auto lg:w-[calc(100dvh*9/19.5)] lg:-translate-x-1/2"
      onCancel={(event) => {
        event.preventDefault();
        if (!isLoading) {
          onClose();
        }
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !isLoading) {
          onClose();
        }
      }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") {
          return;
        }

        const focusableButtons = Array.from(
          event.currentTarget.querySelectorAll<HTMLButtonElement>(
            "button:not(:disabled)",
          ),
        );
        const firstButton = focusableButtons.at(0);
        const lastButton = focusableButtons.at(-1);

        if (event.shiftKey && document.activeElement === firstButton) {
          event.preventDefault();
          lastButton?.focus();
        } else if (!event.shiftKey && document.activeElement === lastButton) {
          event.preventDefault();
          firstButton?.focus();
        }
      }}
      ref={dialogRef}
      role="dialog"
    >
      <div className="safe-area-bottom px-5 pt-6">
        <div className="flex items-start justify-between gap-3">
          <h2 className="break-keep pt-1 type-subheading text-text-primary" id={titleId}>
            {title}
          </h2>
          <button
            aria-label="로그인 안내 닫기"
            className="-mr-2 -mt-2 inline-flex size-11 shrink-0 items-center justify-center text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            disabled={isLoading}
            onClick={onClose}
            type="button"
          >
            <span aria-hidden="true" className="text-2xl leading-none">
              ×
            </span>
          </button>
        </div>
        <p
          className="mt-2 break-keep type-body leading-relaxed text-text-secondary"
          id={descriptionId}
        >
          {description}
        </p>
        {feedback ? (
          <p className="mt-3 type-caption text-error" role="alert">
            {feedback.message}
          </p>
        ) : null}
        <div className="mt-6">
          <KakaoLoginButton
            className="min-h-12"
            isLoading={isLoading}
            label="카카오로 계속하기"
            onClick={() => beginLogin(returnTo)}
          />
        </div>
      </div>
    </dialog>
  );
}
