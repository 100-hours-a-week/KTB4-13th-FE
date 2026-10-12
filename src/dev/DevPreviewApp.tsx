import { useState } from "react";

import { AppLayout } from "@/app/layouts/AppLayout";
import { productPreviewCases, type ProductPreviewCase } from "@/dev/fixtures/products";
import { ProductDetailContent } from "@/pages/product/components/ProductDetailContent";

export default function DevPreviewApp() {
  const [selectedCase, setSelectedCase] = useState<ProductPreviewCase>("discounted");
  const { product } = productPreviewCases[selectedCase];

  return (
    <AppLayout>
      <main className="min-h-dvh bg-surface pb-8">
        <header className="page-content border-b border-hairline py-5">
          <h1 className="type-heading text-text-primary">상품 상세 UI 미리보기</h1>
          <p className="mt-1 type-body-small text-text-secondary">
            개발 전용 데이터입니다. 실제 API 요청이나 주문은 발생하지 않습니다.
          </p>
          <fieldset className="mt-4">
            <legend className="mb-2 type-body-small font-semibold">상품 상태</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(productPreviewCases) as ProductPreviewCase[]).map((caseKey) => (
                <button
                  key={caseKey}
                  type="button"
                  aria-pressed={selectedCase === caseKey}
                  className={`min-h-11 rounded-control border px-4 type-body-small font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
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
        <ProductDetailContent product={product} recommendationReason={null} />
      </main>
    </AppLayout>
  );
}
