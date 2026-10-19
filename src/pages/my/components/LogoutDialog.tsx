import { useEffect, useRef } from "react";

import { Button } from "@/common/components/Button";

interface LogoutDialogProps {
  isLoggingOut: boolean;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function LogoutDialog({
  isLoggingOut,
  isOpen,
  onCancel,
  onConfirm,
}: LogoutDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

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
      dialog.close();
      triggerRef.current?.focus();
      triggerRef.current = null;
    }
  }, [isOpen]);

  return (
    <dialog
      aria-describedby="logout-description"
      aria-labelledby="logout-title"
      aria-modal="true"
      className="m-auto w-[calc(100%-2.5rem)] max-w-sm rounded-panel border-0 bg-surface p-0 text-text-primary backdrop:bg-black/40"
      onCancel={(event) => {
        event.preventDefault();
        if (!isLoggingOut) {
          onCancel();
        }
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !isLoggingOut) {
          onCancel();
        }
      }}
      ref={dialogRef}
      role="dialog"
    >
      <div className="p-6 text-center">
        <h2 className="type-subheading" id="logout-title">
          로그아웃할까요?
        </h2>
        <p
          className="mt-2 type-body-small text-text-secondary"
          id="logout-description"
        >
          다시 이용하려면 로그인이 필요해요
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            disabled={isLoggingOut}
            onClick={onCancel}
            variant="secondary"
          >
            취소
          </Button>
          <Button
            isLoading={isLoggingOut}
            onClick={onConfirm}
            variant="primary"
          >
            로그아웃
          </Button>
        </div>
      </div>
    </dialog>
  );
}
