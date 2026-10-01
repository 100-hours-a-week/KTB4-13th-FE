import { useEffect, useRef } from "react";
import type { RefObject } from "react";

import { Button } from "@/common/components/Button";

interface DeleteAddressDialogProps {
  addressLabel: string;
  fallbackFocusRef: RefObject<HTMLElement | null>;
  isOpen: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteAddressDialog({
  addressLabel,
  fallbackFocusRef,
  isOpen,
  isSubmitting,
  onCancel,
  onConfirm,
}: DeleteAddressDialogProps) {
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
      const focusTarget = triggerRef.current?.isConnected
        ? triggerRef.current
        : fallbackFocusRef.current;
      focusTarget?.focus();
      triggerRef.current = null;
    }
  }, [fallbackFocusRef, isOpen]);

  return (
    <dialog
      aria-describedby="delete-address-description"
      aria-labelledby="delete-address-title"
      aria-modal="true"
      className="m-auto w-[calc(100%-2.5rem)] max-w-sm rounded-panel border border-border bg-surface p-0 text-text-primary backdrop:bg-black/40"
      onCancel={(event) => {
        event.preventDefault();
        if (!isSubmitting) {
          onCancel();
        }
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onCancel();
        }
      }}
      ref={dialogRef}
      role="dialog"
    >
      <div className="p-6 text-center">
        <h2 className="type-heading" id="delete-address-title">
          배송지를 삭제할까요?
        </h2>
        <p
          className="mt-2 type-body-small text-text-secondary"
          id="delete-address-description"
        >
          {addressLabel} 배송지가 목록에서 사라져요
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            disabled={isSubmitting}
            onClick={onCancel}
            variant="secondary"
          >
            아니요
          </Button>
          <Button
            className="bg-accent text-white hover:bg-accent-hover"
            isLoading={isSubmitting}
            onClick={onConfirm}
            variant="custom"
          >
            삭제
          </Button>
        </div>
      </div>
    </dialog>
  );
}
