import { useEffect, useRef } from "react";

import { Button } from "@/common/components/Button";

interface ConfirmDialogProps {
  confirmLabel: string;
  description: string;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
}

export function ConfirmDialog({ confirmLabel, description, isOpen, onCancel, onConfirm, title }: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
      triggerRef.current?.focus();
      triggerRef.current = null;
    }
  }, [isOpen]);
  return <dialog aria-describedby="confirm-dialog-description" aria-labelledby="confirm-dialog-title" className="m-auto w-[calc(100%-2.5rem)] max-w-sm rounded-panel border-0 bg-surface p-0 text-text-primary backdrop:bg-black/45" onCancel={(event) => { event.preventDefault(); onCancel(); }} onClick={(event) => { if (event.target === event.currentTarget) onCancel(); }} ref={dialogRef}>
    <div className="p-5"><h2 className="type-heading" id="confirm-dialog-title">{title}</h2><p className="mt-2 type-body-small text-text-secondary" id="confirm-dialog-description">{description}</p><div className="mt-6 flex gap-2"><Button className="flex-1" onClick={onCancel} variant="secondary">취소</Button><Button className="flex-1 bg-error" onClick={onConfirm}>{confirmLabel}</Button></div></div>
  </dialog>;
}
