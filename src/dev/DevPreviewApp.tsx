import { useState } from "react";

import { AppLayout } from "@/app/layouts/AppLayout";
import { productPreviewCases, type ProductPreviewCase } from "@/dev/fixtures/products";
import { ProductDetailContent } from "@/pages/product/components/ProductDetailContent";
import { PurchaseBar } from "@/pages/product/components/PurchaseBar";

export default function DevPreviewApp() {
  const [selectedCase, setSelectedCase] = useState<ProductPreviewCase>("discounted");
  const { product } = productPreviewCases[selectedCase];

  return (
    <AppLayout>
      <div className="flex h-dvh min-w-0 flex-col bg-surface">
        <header className="page-content shrink-0 border-b border-hairline py-3">
          <h1 className="type-title text-text-primary">상품 상세 미리보기</h1>
          <p className="mt-1 type-caption text-text-secondary">
            개발 전용 · 실제 API 및 구매 요청 없음
          </p>
          <fieldset className="mt-3">
            <legend className="sr-only">상품 상태</legend>
            <div className="flex gap-2">
              {(Object.keys(productPreviewCases) as ProductPreviewCase[]).map((caseKey) => (
                <button
                  key={caseKey}
                  type="button"
                  aria-pressed={selectedCase === caseKey}
                  className={`min-h-11 flex-1 rounded-control border px-3 type-body-small font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    selectedCase === caseKey
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-surface text-text-primary"
                  }`}
                  onClick={() => setSelectedCase(caseKey)}
                >
                  {productPreviewCases[caseKey].label}
                </button>
              ))}
            </div>
          </fieldset>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto">
          <ProductDetailContent product={product} recommendationReason={null} />
        </main>
        <PurchaseBar
          isAddingToCart={false}
          isBuyingNow={false}
          isSoldOut={product.stockQuantity <= 0}
          price={product.discountedPrice}
          onAddToCart={() => window.alert("개발용 미리보기에서는 장바구니를 이용할 수 없습니다.")}
          onBuyNow={() => window.alert("개발용 미리보기에서는 주문을 생성하지 않습니다.")}
        />
      </div>
    </AppLayout>
  );
}
