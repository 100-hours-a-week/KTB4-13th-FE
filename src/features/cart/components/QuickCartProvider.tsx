import { useRef, useState, type PropsWithChildren } from "react";
import { useLocation } from "react-router-dom";

import { Toast } from "@/common/components/Toast";
import { useTransientNotice } from "@/common/hooks/useTransientNotice";
import { LoginRequiredDialog } from "@/features/auth/components/LoginRequiredDialog";
import { useAuth } from "@/features/auth/context/useAuth";
import { addCartItem } from "@/features/cart/api/cartApi";
import { CartAddedNotice, type CartAddedItem } from "@/features/cart/components/CartAddedNotice";
import { QuickCartContext, type QuickCartItem } from "@/features/cart/context/quickCartContext";
import { notifyCartChanged } from "@/features/cart/lib/cartEvents";

export function QuickCartProvider({ children }: PropsWithChildren) {
  const { pathname, search } = useLocation();
  const { status } = useAuth();
  const pendingRef = useRef(false);
  const [pendingProductId, setPendingProductId] = useState<number | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { notice, showNotice } = useTransientNotice<string | CartAddedItem>(3_500);

  const add = async (item: QuickCartItem) => {
    if (pendingRef.current || status === "initializing") return;
    if (status !== "authenticated") {
      setIsLoginOpen(true);
      return;
    }

    pendingRef.current = true;
    setPendingProductId(item.productId);
    showNotice(null);
    const result = await addCartItem(item.productId, 1);
    pendingRef.current = false;
    setPendingProductId(null);

    if (result.ok) {
      notifyCartChanged({ animate: true });
      showNotice(item);
    } else if (result.reason === "unauthorized") {
      setIsLoginOpen(true);
    } else {
      showNotice(result.reason === "stock"
        ? "재고가 부족해 장바구니에 담지 못했어요"
        : "장바구니에 담지 못했어요. 다시 시도해 주세요");
    }
  };

  return (
    <QuickCartContext.Provider value={{ add, isDisabled: pendingProductId !== null || status === "initializing", pendingProductId }}>
      {children}
      <p className="sr-only" role="status">{pendingProductId !== null ? "장바구니에 담고 있어요" : ""}</p>
      {notice ? (
        <div className="page-content pointer-events-none absolute inset-x-0 bottom-3 z-20">
          {typeof notice === "string"
            ? <Toast variant="error">{notice}</Toast>
            : <CartAddedNotice item={notice} />}
        </div>
      ) : null}
      <LoginRequiredDialog
        description="로그인하면 이 목록에서 계속 둘러볼 수 있어요."
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        returnTo={`${pathname}${search}`}
        title="장바구니에 담으려면 로그인이 필요해요"
      />
    </QuickCartContext.Provider>
  );
}
