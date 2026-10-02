import { useEffect, useRef } from "react";
import type { RefObject } from "react";

import { Button } from "@/common/components/Button";

interface OrderedCartCleanupDialogProps {
  fallbackFocusRef: RefObject<HTMLElement | null>;
  isOpen: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function OrderedCartCleanupDialog({
  fallbackFocusRef,
  isOpen,
  isSubmitting,
  onCancel,
  onConfirm,
}: OrderedCartCleanupDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
      fallbackFocusRef.current?.focus();
    }
  }, [fallbackFocusRef, isOpen]);

  return (
    <dialog
      aria-describedby="ordered-cart-cleanup-description"
      aria-labelledby="ordered-cart-cleanup-title"
      aria-modal="true"
      className="m-auto w-[calc(100%-2.5rem)] max-w-sm rounded-panel border-0 bg-surface p-0 text-text-primary backdrop:bg-black/40"
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
        <h2 className="type-subheading" id="ordered-cart-cleanup-title">
          주문한 상품이 장바구니에 남아 있어요
        </h2>
        <p
          className="mt-2 break-keep type-body-small text-text-secondary"
          id="ordered-cart-cleanup-description"
        >
          방금 주문한 수량만큼 장바구니에서 정리할까요?
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            disabled={isSubmitting}
            onClick={onCancel}
            variant="secondary"
          >
            그대로 둘게요
          </Button>
          <Button
            isLoading={isSubmitting}
            onClick={onConfirm}
          >
            정리하기
          </Button>
        </div>
      </div>
    </dialog>
  );
}
