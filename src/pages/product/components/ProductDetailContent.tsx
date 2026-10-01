import { useEffect, useRef, useState } from "react";

import { BookCover } from "@/common/components/BookCover";
import type { ProductDetail } from "@/features/product/types/product";

const priceFormatter = new Intl.NumberFormat("ko-KR");

function ProductPrice({ product }: { product: ProductDetail }) {
  const isSoldOut = product.stockQuantity <= 0;
  const hasDiscount = product.discountedPrice !== product.salePrice;

  if (isSoldOut) {
    return (
      <p
        className="type-title font-bold text-error"
        id="product-sold-out-reason"
      >
        일시 품절
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      <p className="type-title font-bold text-text-primary">
        {priceFormatter.format(
          hasDiscount ? product.discountedPrice : product.salePrice,
        )}
        원
      </p>
      {hasDiscount ? (
        <del className="type-caption text-text-tertiary">
          {priceFormatter.format(product.salePrice)}원
        </del>
      ) : null}
    </div>
  );
}

function BookDescription({ description }: { description: string | null }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const normalizedDescription = description?.trim();

  // Offers the toggle only when the line clamp actually cuts the text, re-measuring when the width changes.
  useEffect(() => {
    const descriptionElement = descriptionRef.current;

    if (!descriptionElement || isExpanded) {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      setIsClamped(
        descriptionElement.scrollHeight > descriptionElement.clientHeight,
      );
    });
    observer.observe(descriptionElement);

    return () => observer.disconnect();
  }, [isExpanded, normalizedDescription]);

  if (!normalizedDescription) {
    return null;
  }

  return (
    <section aria-labelledby="book-description-title" className="border-b border-border py-6">
      <h2
        className="type-title text-text-primary"
        id="book-description-title"
      >
        책 소개
      </h2>
      <p
        className={`mt-3 break-words whitespace-pre-line type-body text-text-primary ${
          isExpanded ? "" : "line-clamp-4"
        }`}
        id="book-description-content"
        ref={descriptionRef}
      >
        {normalizedDescription}
      </p>
      {isExpanded || isClamped ? (
        <button
          aria-controls="book-description-content"
          aria-expanded={isExpanded}
          className="mt-3 min-h-11 rounded-control border border-border px-4 type-body-small font-semibold text-text-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={() => setIsExpanded((current) => !current)}
          type="button"
        >
          {isExpanded ? "접기" : "더보기"}
        </button>
      ) : null}
    </section>
  );
}

interface ProductDetailContentProps {
  product: ProductDetail;
  recommendationReason: string | null;
}

export function ProductDetailContent({
  product,
  recommendationReason,
}: ProductDetailContentProps) {
  return (
    <article className="page-content">
      <section className="flex gap-4 border-b border-border py-6">
        <div className="w-28 shrink-0">
          <BookCover
            alt={`${product.itemName} 표지`}
            fallbackTitle={product.itemName}
            thumbnailUrl={product.thumbnailUrl}
          />
        </div>
        <div className="min-w-0 flex-1 self-center">
          <p className="break-words type-caption font-medium text-text-secondary">
            <span className="sr-only">분류 </span>
            {product.category}
          </p>
          <h2 className="mt-1 break-words type-subheading text-text-primary">
            {product.itemName}
          </h2>
          <dl className="mt-2 space-y-0.5 text-text-secondary">
            <div>
              <dt className="sr-only">저자</dt>
              <dd className="break-words type-body-small">{product.author}</dd>
            </div>
            <div>
              <dt className="sr-only">출판사</dt>
              <dd className="break-words type-caption">{product.publisher}</dd>
            </div>
            <div>
              <dt className="sr-only">출간일</dt>
              <dd className="type-caption">
                {product.publishedAt.replaceAll("-", ".")}
              </dd>
            </div>
          </dl>
          <div className="mt-4">
            <ProductPrice product={product} />
          </div>
        </div>
      </section>

      <BookDescription description={product.description} />

      {recommendationReason ? (
        <section
          aria-labelledby="recommendation-reason-title"
          className="border-b border-border py-6"
        >
          <h2
            className="type-title text-accent"
            id="recommendation-reason-title"
          >
            AI 추천 이유
          </h2>
          <p className="mt-3 break-words rounded-panel border border-accent bg-accent-soft p-4 type-body-small text-text-secondary">
            {recommendationReason}
          </p>
        </section>
      ) : null}
    </article>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div aria-busy="true" className="page-content py-6">
      <p className="sr-only" role="status">
        도서 정보를 불러오는 중이에요
      </p>
      <div aria-hidden="true" className="flex gap-4">
        <div className="aspect-[3/4] w-28 shrink-0 rounded-control bg-muted" />
        <div className="flex flex-1 flex-col justify-center gap-3">
          <div className="h-5 w-full rounded bg-muted" />
          <div className="h-4 w-2/3 rounded bg-muted" />
          <div className="h-4 w-1/2 rounded bg-muted" />
          <div className="h-5 w-1/3 rounded bg-muted" />
        </div>
      </div>
      <div aria-hidden="true" className="mt-8 space-y-3 border-t border-border pt-6">
        <div className="h-5 w-1/4 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
      </div>
    </div>
  );
}
