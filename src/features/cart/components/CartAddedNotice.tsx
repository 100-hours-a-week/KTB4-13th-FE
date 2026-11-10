import { Link } from "react-router-dom";

import { BookCover } from "@/common/components/BookCover";

export interface CartAddedItem {
  thumbnailUrl: string | null;
  title: string;
}

// Shows which book went into the cart and a way to it, instead of a bare "담았어요" line.
export function CartAddedNotice({ item }: { item: CartAddedItem }) {
  return (
    <div
      aria-live="polite"
      className="cart-added-enter pointer-events-auto flex items-center gap-3 rounded-panel bg-primary py-2.5 pl-3 pr-2 text-white shadow-[0_12px_28px_-16px_rgba(0,0,0,0.7)]"
      role="status"
    >
      <div className="w-8 shrink-0">
        <BookCover alt="" fallbackTitle={item.title} radius="cover" thumbnailUrl={item.thumbnailUrl} />
      </div>
      <p className="min-w-0 flex-1 type-body-small">
        <span className="block truncate font-semibold">{item.title}</span>
        <span className="text-white/75">장바구니에 담았어요</span>
      </p>
      <Link
        className="inline-flex min-h-11 shrink-0 items-center rounded-control px-3 type-body-small font-semibold text-white underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        to="/cart"
      >
        장바구니 보기
      </Link>
    </div>
  );
}
