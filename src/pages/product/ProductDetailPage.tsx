import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import { BottomNavigation } from "@/common/components/BottomNavigation";
import { RetryButton } from "@/common/components/RetryButton";
import { Toast } from "@/common/components/Toast";
import { useTransientNotice } from "@/common/hooks/useTransientNotice";
import { addCartItem } from "@/features/cart/api/cartApi";
import { LoginRequiredDialog } from "@/features/auth/components/LoginRequiredDialog";
import { useAuth } from "@/features/auth/context/useAuth";
import type { OrderNavigationState } from "@/features/order/types/order";
import { ProductDetailContent, ProductDetailSkeleton } from "@/pages/product/components/ProductDetailContent";
import { ProductHeader } from "@/pages/product/components/ProductHeader";
import { PurchaseBar } from "@/pages/product/components/PurchaseBar";
import { useProductDetail } from "@/pages/product/hooks/useProductDetail";

const PURCHASE_QUANTITY = 1;

function parseProductId(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function readRecommendationReason(state: unknown) {
  if (typeof state !== "object" || state === null) {
    return null;
  }

  const reason = Reflect.get(state, "recommendationReason");
  return typeof reason === "string" && reason.trim() ? reason.trim() : null;
}

export function ProductDetailPage() {
  const { productId: productIdParam } = useParams();
  const productId = parseProductId(productIdParam);
  const location = useLocation();
  const navigate = useNavigate();
  const { status: authStatus } = useAuth();
  const { notice, showNotice } = useTransientNotice();
  const { retry, state } = useProductDetail(productId);
  const [pendingPurchaseAction, setPendingPurchaseAction] = useState<
    "cart" | "buy-now" | null
  >(null);
  const [loginRequiredAction, setLoginRequiredAction] = useState<
    "cart" | "buy-now" | null
  >(null);
  const recommendationReason = readRecommendationReason(location.state);
  const product = state.kind === "ready" ? state.data : null;

  const handleBack = () => {
    if (location.key === "default") {
      navigate("/", { replace: true });
      return;
    }

    navigate(-1);
  };

  const addProductToCart = async (
    productId: number,
    action: "cart" | "buy-now",
  ) => {
    setPendingPurchaseAction(action);
    const result = await addCartItem(productId, PURCHASE_QUANTITY);
    setPendingPurchaseAction(null);

    if (result.ok) {
      return true;
    }
    if (result.reason === "unauthorized") {
      setLoginRequiredAction(action);
      return false;
    }
    if (result.reason === "stock") {
      showNotice("재고가 부족해 장바구니에 담지 못했어요");
      retry();
      return false;
    }
    showNotice("장바구니에 담지 못했어요. 다시 시도해 주세요");
    return false;
  };

  const handleAddToCart = async () => {
    if (!product || pendingPurchaseAction) {
      return;
    }
    if (authStatus !== "authenticated") {
      setLoginRequiredAction("cart");
      return;
    }

    if (await addProductToCart(product.productId, "cart")) {
      showNotice("장바구니에 담았어요.");
    }
  };

  // Orders accept only products already in the cart, so buy-now adds the product first.
  const handleBuyNow = async () => {
    if (!product || pendingPurchaseAction) {
      return;
    }
    if (authStatus !== "authenticated") {
      setLoginRequiredAction("buy-now");
      return;
    }

    if (!(await addProductToCart(product.productId, "buy-now"))) {
      return;
    }

    const orderState: OrderNavigationState = {
      items: [
        {
          discountedPrice: product.discountedPrice,
          itemName: product.itemName,
          productId: product.productId,
          quantity: PURCHASE_QUANTITY,
          thumbnailUrl: product.thumbnailUrl,
        },
      ],
    };
    navigate("/order", { state: orderState });
  };

  return (
    <div className="relative flex h-dvh w-full min-w-0 flex-col overflow-x-hidden bg-surface">
      <ProductHeader
        onBack={handleBack}
        onCartClick={() => {
          if (authStatus !== "authenticated") {
            setLoginRequiredAction("cart");
            return;
          }
          navigate("/cart");
        }}
      />

      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        {state.kind === "loading" ? <ProductDetailSkeleton /> : null}

        {state.kind === "not-found" ? (
          <section className="page-content flex min-h-64 flex-col items-center justify-center gap-2 py-12 text-center">
            <h2 className="type-title text-text-primary">
              존재하지 않는 도서입니다
            </h2>
            <p className="type-body-small text-text-secondary">
              상품 정보를 다시 확인해 주세요
            </p>
            <Link
              className="mt-3 inline-flex min-h-11 items-center rounded-control bg-primary px-5 type-body-small font-semibold text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              to="/"
            >
              홈으로 이동
            </Link>
          </section>
        ) : null}

        {state.kind === "error" ? (
          <div className="page-content py-6">
            <Toast action={<RetryButton onClick={retry} />} variant="error">
              도서 정보를 불러오지 못했어요
            </Toast>
          </div>
        ) : null}

        {product ? (
          <ProductDetailContent
            product={product}
            recommendationReason={recommendationReason}
          />
        ) : null}
      </main>

      {notice ? (
        <div
          className={`page-content pointer-events-none absolute inset-x-0 z-10 ${
            product ? "bottom-40" : "bottom-20"
          }`}
        >
          <Toast>{notice}</Toast>
        </div>
      ) : null}

      {product ? (
        <PurchaseBar
          isAddingToCart={pendingPurchaseAction === "cart"}
          isBuyingNow={pendingPurchaseAction === "buy-now"}
          isSoldOut={product.stockQuantity <= 0}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      ) : null}
      <BottomNavigation />
      <LoginRequiredDialog
        description="로그인하면 보고 있던 책에서 계속할 수 있어요."
        isOpen={loginRequiredAction !== null}
        onClose={() => setLoginRequiredAction(null)}
        returnTo={`${location.pathname}${location.search}`}
        title={
          loginRequiredAction === "buy-now"
            ? "구매하려면 로그인이 필요해요"
            : "장바구니를 이용하려면 로그인이 필요해요"
        }
      />
    </div>
  );
}
