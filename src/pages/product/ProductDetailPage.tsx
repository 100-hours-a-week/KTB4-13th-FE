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
import { useAuth } from "@/features/auth/context/useAuth";
import { ProductDetailContent, ProductDetailSkeleton } from "@/pages/product/components/ProductDetailContent";
import { ProductHeader } from "@/pages/product/components/ProductHeader";
import { PurchaseBar } from "@/pages/product/components/PurchaseBar";
import { useProductDetail } from "@/pages/product/hooks/useProductDetail";

const UNAVAILABLE_NOTICE = "아직 준비 중인 기능이에요";

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
  const { retry, state } = useProductDetail(productId, authStatus);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const recommendationReason = readRecommendationReason(location.state);
  const product = state.kind === "ready" ? state.data : null;

  const goToLogin = () => {
    navigate("/login", {
      state: { returnTo: location.pathname },
    });
  };

  const handleBack = () => {
    if (location.key === "default") {
      navigate("/", { replace: true });
      return;
    }

    navigate(-1);
  };

  const handleAddToCart = async () => {
    if (!product || isAddingToCart) {
      return;
    }
    if (authStatus !== "authenticated") {
      goToLogin();
      return;
    }

    setIsAddingToCart(true);
    const result = await addCartItem(product.productId, 1);
    setIsAddingToCart(false);

    if (result.ok) {
      showNotice("장바구니에 담았어요.");
      return;
    }
    if (result.reason === "unauthorized") {
      goToLogin();
      return;
    }
    if (result.reason === "stock") {
      showNotice("재고가 부족해 장바구니에 담지 못했어요");
      retry();
      return;
    }
    showNotice("장바구니에 담지 못했어요. 다시 시도해 주세요");
  };

  const handleBuyNow = () => {
    if (authStatus !== "authenticated") {
      goToLogin();
      return;
    }

    showNotice("바로 구매 기능을 준비하고 있어요");
  };

  return (
    <div className="relative flex h-dvh w-full min-w-0 flex-col overflow-x-hidden bg-surface">
      <ProductHeader
        onBack={handleBack}
        onCartClick={() => showNotice("장바구니 화면을 준비하고 있어요")}
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

        {state.kind === "authentication-required" ? (
          <section className="page-content flex min-h-64 flex-col items-center justify-center gap-2 py-12 text-center">
            <h2 className="type-title text-text-primary">로그인이 필요합니다</h2>
            <p className="type-body-small text-text-secondary">
              로그인 후 도서 상세 정보를 확인할 수 있어요
            </p>
            <Link
              className="mt-3 inline-flex min-h-11 items-center rounded-control bg-primary px-5 type-body-small font-semibold text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              state={{ returnTo: location.pathname }}
              to="/login"
            >
              로그인하기
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
          isAddingToCart={isAddingToCart}
          isSoldOut={product.stockQuantity <= 0}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      ) : null}
      <BottomNavigation
        onUnavailableTabClick={() => showNotice(UNAVAILABLE_NOTICE)}
      />
    </div>
  );
}
