import { useCartQuickAdd, type QuickAddItem } from "@/features/cart/lib/cartQuickAddContext";

// Sits beside a book link (never inside it: a button in a link is invalid and swallows the tap).
export function QuickAddButton({
  className = "",
  item,
  variant = "icon",
}: {
  className?: string;
  item: QuickAddItem;
  variant?: "icon" | "label";
}) {
  const quickAdd = useCartQuickAdd();
  if (!quickAdd) return null;

  const isAdding = quickAdd.isAdding(item.productId);

  return (
    <button
      aria-busy={isAdding || undefined}
      aria-label={`${item.title} 장바구니에 담기`}
      className={`inline-flex shrink-0 items-center justify-center gap-1 rounded-full border border-border-strong bg-surface/95 font-semibold text-text-primary shadow-[0_4px_12px_-8px_rgba(36,33,31,0.6)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:text-text-tertiary ${
        variant === "icon" ? "size-9 text-lg leading-none" : "min-h-9 px-3 type-caption"
      } ${className}`}
      disabled={isAdding}
      onClick={() => quickAdd.addToCart(item)}
      type="button"
    >
      <span aria-hidden="true">+</span>
      {variant === "label" ? <span aria-hidden="true">담기</span> : null}
    </button>
  );
}
