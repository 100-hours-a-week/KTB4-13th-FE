import type { ReactNode } from "react";

interface LibraryNoticeProps {
  action?: { isBusy?: boolean; label: string; onClick: () => void };
  children: ReactNode;
}

// 도서관 아래쪽에 잠깐 뜨는 알림(담았어요·뺐어요). 뺀 뒤에는 되돌리기를 붙인다. 모양은 장바구니 담기 알림과 같다
export function LibraryNotice({ action, children }: LibraryNoticeProps) {
  return (
    <div
      aria-live="polite"
      className="cart-added-enter pointer-events-auto flex min-h-14 items-center gap-3 rounded-panel bg-primary py-2 pl-4 pr-2 text-white shadow-[0_12px_28px_-16px_rgba(0,0,0,0.7)]"
      role="status"
    >
      <p className="min-w-0 flex-1 type-body-small">{children}</p>
      {action ? (
        <button
          className="inline-flex min-h-11 shrink-0 items-center rounded-control px-3 type-body-small font-semibold text-white underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-60"
          disabled={action.isBusy}
          onClick={action.onClick}
          type="button"
        >
          {action.label}
        </button>
      ) : null}
    </div>
  );
}
