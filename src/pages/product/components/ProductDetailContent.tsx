import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { BookCover } from "@/common/components/BookCover";
import type { ProductDetail } from "@/features/product/types/product";
import { fetchProductReviewCount, fetchProductReviews } from "@/features/review/api/reviewApi";

const priceFormatter = new Intl.NumberFormat("ko-KR");

function ProductPrice({ product }: { product: ProductDetail }) {
  const isSoldOut = product.stockQuantity <= 0;
  const hasDiscount =
    product.salePrice > 0 && product.discountedPrice < product.salePrice;
  const discountRate = hasDiscount
    ? Math.round(
        ((product.salePrice - product.discountedPrice) / product.salePrice) * 100,
      )
    : 0;

  return (
    <div className="space-y-2">
      <p className="type-caption text-text-secondary">판매가</p>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="type-heading font-bold tabular-nums text-text-primary">
          {priceFormatter.format(
            hasDiscount ? product.discountedPrice : product.salePrice,
          )}
          원
        </p>
        {hasDiscount && discountRate > 0 ? (
          <span className="type-body-small font-semibold tabular-nums text-accent">
            {discountRate}%
          </span>
        ) : null}
        {hasDiscount ? (
          <del className="type-body-small tabular-nums text-text-tertiary">
            {priceFormatter.format(product.salePrice)}원
          </del>
        ) : null}
      </div>
      {isSoldOut ? (
        <div
          className="flex items-start gap-2 rounded-control bg-muted px-3 py-3"
          id="product-sold-out-reason"
          role="status"
        >
          <span className="shrink-0 rounded bg-surface px-2 py-0.5 type-caption font-semibold text-text-secondary">
            품절
          </span>
          <p className="type-body-small leading-relaxed text-text-secondary">
            지금은 구매할 수 없어요.
          </p>
        </div>
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
    <section aria-labelledby="book-description-title" className="border-b border-hairline py-6">
      <h2
        className="type-title text-text-primary"
        id="book-description-title"
      >
        책 소개
      </h2>
      <p
        className={`mt-3 break-words whitespace-pre-line type-body leading-relaxed text-text-primary ${
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
          className="-ml-1 mt-1 min-h-11 px-1 type-body-small font-semibold text-text-secondary underline-offset-4 transition-colors hover:text-text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
  const [reviewSummary, setReviewSummary] = useState<{
    productId: number;
    rate: number;
  } | null>(null);
  const [reviewCount, setReviewCount] = useState<{
    productId: number;
    value: number | null;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void fetchProductReviews(product.productId, 0, 20, controller.signal, true).then((result) => {
      if (controller.signal.aborted || !result.ok) return;
      const reviews = result.data.reviews;
      const rate = reviews.length > 0 && !result.data.hasNext
        ? reviews.reduce((sum, review) => sum + review.rate, 0) / reviews.length
        : product.reviewRate;
      setReviewSummary({ productId: product.productId, rate });
    });
    return () => controller.abort();
  }, [product.productId, product.reviewRate]);

  useEffect(() => {
    const controller = new AbortController();
    void fetchProductReviewCount(product.productId, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      setReviewCount({
        productId: product.productId,
        value: result.ok ? result.count : null,
      });
    });
    return () => controller.abort();
  }, [product.productId]);

  const shownReviewCount = reviewCount?.productId === product.productId
    ? reviewCount.value === null
      ? "리뷰 개수를 불러오지 못했어요"
      : `${reviewCount.value.toLocaleString("ko-KR")}개의 리뷰`
    : "리뷰 개수를 불러오는 중이에요";
  const shownReviewRate = reviewSummary?.productId === product.productId
    ? reviewSummary.rate : product.reviewRate;

  return (
    <article className="page-content">
      <section className="border-b border-hairline pb-7">
        <div className="-mx-5 flex justify-center bg-muted px-5 py-8">
          <div className="w-[44%] max-w-44">
            <BookCover
              alt={`${product.itemName} 표지`}
              fallbackTitle={product.itemName}
              radius="cover"
              thumbnailUrl={product.thumbnailUrl}
            />
          </div>
        </div>
        <div className="min-w-0 pt-6">
          <p className="break-words type-caption text-text-tertiary">
            <span className="sr-only">분류 </span>
            {product.category}
          </p>
          <h2 className="mt-2 break-words break-keep type-section text-text-primary">
            {product.itemName}
          </h2>
          <dl className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-text-secondary">
            <div>
              <dt className="sr-only">저자</dt>
              <dd className="type-body-small">{product.author}</dd>
            </div>
            <div>
              <dt className="sr-only">출판사</dt>
              <dd className="type-body-small">{product.publisher}</dd>
            </div>
            <div>
              <dt className="sr-only">출간일</dt>
              <dd className="type-caption tabular-nums text-text-tertiary">
                {product.publishedAt.replaceAll("-", ".")}
              </dd>
            </div>
          </dl>
          <div className="mt-5 border-t border-hairline pt-5">
            <ProductPrice product={product} />
          </div>
        </div>
      </section>

      <BookDescription description={product.description} />

      <section className="border-b border-hairline py-7" aria-labelledby="product-review-title">
        <div className="flex items-center justify-between gap-3">
          <h2 className="type-title" id="product-review-title">리뷰</h2>
          <Link className="inline-flex min-h-11 items-center type-body-small font-semibold text-text-secondary" to={`/products/${product.productId}/reviews`}>전체 보기 ›</Link>
        </div>
        <Link className="mt-2 flex min-h-16 items-center justify-between rounded-panel bg-muted px-4 focus-visible:outline-2 focus-visible:outline-primary" to={`/products/${product.productId}/reviews`}>
          <span className="flex items-center gap-2"><span aria-hidden="true" className="text-[#f2b84b]">★</span><strong className="type-heading tabular-nums">{shownReviewRate.toFixed(1)}</strong></span>
          <span aria-live="polite" className="type-body-small text-text-secondary">{shownReviewCount}</span>
        </Link>
      </section>

      {recommendationReason ? (
        <section
          aria-labelledby="recommendation-reason-title"
          className="border-b border-hairline py-6"
        >
          <h2
            className="type-caption font-semibold text-accent"
            id="recommendation-reason-title"
          >
            AI 추천 이유
          </h2>
          <p className="mt-3 break-words border-l-2 border-accent pl-4 type-body leading-relaxed text-text-primary">
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
      <div aria-hidden="true" className="flex flex-col items-center">
        <div className="aspect-[3/4] w-[46%] max-w-48 rounded-cover bg-muted" />
        <div className="mt-7 flex w-full flex-col items-center gap-3">
          <div className="h-6 w-3/4 rounded bg-muted" />
          <div className="h-4 w-1/2 rounded bg-muted" />
          <div className="h-4 w-1/3 rounded bg-muted" />
          <div className="h-6 w-1/4 rounded bg-muted" />
        </div>
      </div>
      <div aria-hidden="true" className="mt-8 space-y-3 border-t border-hairline pt-8">
        <div className="h-5 w-1/4 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
      </div>
    </div>
  );
}
