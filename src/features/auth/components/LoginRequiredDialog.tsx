import { useEffect, useId, useRef } from "react";

import { Button } from "@/common/components/Button";
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
      className="m-auto w-[calc(100%-2.5rem)] max-w-sm rounded-panel border border-border bg-surface p-0 text-text-primary backdrop:bg-black/40"
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
      ref={dialogRef}
      role="dialog"
    >
      <div className="p-6 text-center">
        <h2 className="type-heading" id={titleId}>
          {title}
        </h2>
        <p
          className="mt-2 type-body-small text-text-secondary"
          id={descriptionId}
        >
          {description}
        </p>
        {feedback ? (
          <p className="mt-3 type-caption text-error" role="alert">
            {feedback.message}
          </p>
        ) : null}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button disabled={isLoading} onClick={onClose} variant="secondary">
            취소
          </Button>
          <KakaoLoginButton
            isLoading={isLoading}
            label="로그인"
            onClick={() => beginLogin(returnTo)}
          />
        </div>
      </div>
    </dialog>
  );
}
