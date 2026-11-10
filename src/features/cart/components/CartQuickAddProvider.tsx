import { type PropsWithChildren, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import { Toast } from "@/common/components/Toast";
import { useTransientNotice } from "@/common/hooks/useTransientNotice";
import { LoginRequiredDialog } from "@/features/auth/components/LoginRequiredDialog";
import { useAuth } from "@/features/auth/context/useAuth";
import { addCartItem } from "@/features/cart/api/cartApi";
import { CartAddedNotice, type CartAddedItem } from "@/features/cart/components/CartAddedNotice";
import { notifyCartChanged } from "@/features/cart/lib/cartEvents";
import { CartQuickAddContext, type QuickAddItem } from "@/features/cart/lib/cartQuickAddContext";

const QUICK_ADD_QUANTITY = 1;

// Owns the add request, the confirmation and the login prompt for every quick-add button below it.
export function CartQuickAddProvider({ children }: PropsWithChildren) {
  const location = useLocation();
  const { status: authStatus } = useAuth();
  const [pendingIds, setPendingIds] = useState<ReadonlySet<number>>(new Set());
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const { notice: error, showNotice: showError } = useTransientNotice();
  const { notice: addedItem, showNotice: showAddedItem } = useTransientNotice<CartAddedItem>(3_500);

  const value = useMemo(() => {
    const setPending = (productId: number, isPending: boolean) =>
      setPendingIds((current) => {
        const next = new Set(current);
        if (isPending) next.add(productId);
        else next.delete(productId);
        return next;
      });

    return {
      addToCart: (item: QuickAddItem) => {
        if (authStatus !== "authenticated") {
          setIsLoginPromptOpen(true);
          return;
        }
        if (pendingIds.has(item.productId)) return;

        setPending(item.productId, true);
        void addCartItem(item.productId, QUICK_ADD_QUANTITY).then((result) => {
          setPending(item.productId, false);
          if (result.ok) {
            notifyCartChanged({ animate: true });
            showError(null);
            showAddedItem({ thumbnailUrl: item.thumbnailUrl, title: item.title });
            return;
          }
          if (result.reason === "unauthorized") {
            setIsLoginPromptOpen(true);
            return;
          }
          showAddedItem(null);
          showError(
            result.reason === "stock"
              ? "재고가 부족해 장바구니에 담지 못했어요"
              : "장바구니에 담지 못했어요. 다시 시도해 주세요",
          );
        });
      },
      isAdding: (productId: number) => pendingIds.has(productId),
    };
  }, [authStatus, pendingIds, showAddedItem, showError]);

  return (
    <CartQuickAddContext.Provider value={value}>
      {children}
      {error || addedItem ? (
        <div className="page-content pointer-events-none absolute inset-x-0 bottom-3 z-20">
          {error ? <Toast variant="error">{error}</Toast> : addedItem ? <CartAddedNotice item={addedItem} /> : null}
        </div>
      ) : null}
      <LoginRequiredDialog
        description="로그인하면 보고 있던 화면에서 바로 담을 수 있어요."
        isOpen={isLoginPromptOpen}
        onClose={() => setIsLoginPromptOpen(false)}
        returnTo={`${location.pathname}${location.search}`}
        title="장바구니에 담으려면 로그인이 필요해요"
      />
    </CartQuickAddContext.Provider>
  );
}
