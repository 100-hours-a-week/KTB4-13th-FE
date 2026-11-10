import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { BookCover } from "@/common/components/BookCover";
import { COVER_TRANSITION_NAME, type CoverPreview } from "@/common/lib/coverTransition";
import type { ProductDetail } from "@/features/product/types/product";
import { fetchProductReviewCount, fetchProductReviews } from "@/features/review/api/reviewApi";
import { ReviewRatingDistribution } from "@/features/review/components/ReviewRatingDistribution";
import type { ProductReview } from "@/features/review/types/review";
import { AuthorOtherBooks } from "@/pages/product/components/AuthorOtherBooks";
import { ProductSectionLinks } from "@/pages/product/components/ProductSectionLinks";
import { useAuthorOtherBooks } from "@/pages/product/hooks/useAuthorOtherBooks";

const priceFormatter = new Intl.NumberFormat("ko-KR");

// The cover itself, blurred, behind the cover: a backdrop in the book's own colours without a colour API.
function CoverBackdrop({ thumbnailUrl }: { thumbnailUrl: string | null }) {
  const imageUrl = thumbnailUrl?.trim() ?? "";
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (!imageUrl || imageUrl === failedUrl) {
    return null;
  }

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <img
        alt=""
        className={`size-full scale-125 object-cover blur-[20px] saturate-[1.1] transition-opacity duration-(--duration-enter) ease-standard motion-reduce:transition-none ${
          imageUrl === loadedUrl ? "opacity-55" : "opacity-0"
        }`}
        onError={() => setFailedUrl(imageUrl)}
        onLoad={() => setLoadedUrl(imageUrl)}
        src={imageUrl}
      />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-b from-transparent to-surface" />
    </div>
  );
}

// Shared by the page and its loading state, so a cover that grew in from a list stays in place when data arrives.
function DetailCoverHero({
  alt,
  thumbnailUrl,
  title,
}: {
  alt: string;
  thumbnailUrl: string | null;
  title: string;
}) {
  return (
    <div className="relative -mx-5 flex justify-center overflow-hidden bg-muted px-5 pb-9 pt-10">
      <CoverBackdrop thumbnailUrl={thumbnailUrl} />
      <div
        className="relative w-[48%] max-w-52 rounded-cover shadow-[0_0_4px_rgba(0,0,0,0.12),2px_6px_12px_rgba(0,0,0,0.12)]"
        data-cover-target=""
        style={{ viewTransitionName: COVER_TRANSITION_NAME }}
      >
        <BookCover alt={alt} fallbackTitle={title} radius="cover" thumbnailUrl={thumbnailUrl} />
      </div>
    </div>
  );
}

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
        className="scroll-mt-16 type-title text-text-primary"
        id="book-description-title"
        tabIndex={-1}
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
  const otherBooks = useAuthorOtherBooks(product);
  const [reviewSummary, setReviewSummary] = useState<{
    completeReviews: ProductReview[] | null;
    productId: number;
    rate: number;
    countLabel: string;
    // null when the count could not be confirmed, so "no reviews yet" is shown only when it is certain.
    count: number | null;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.all([
      fetchProductReviews(product.productId, 0, 20, controller.signal, true),
      fetchProductReviewCount(product.productId, controller.signal),
    ]).then(([reviewsResult, countResult]) => {
      if (controller.signal.aborted) return;
      if (!reviewsResult.ok) {
        setReviewSummary({
          completeReviews: null,
          productId: product.productId,
          rate: product.reviewRate,
          countLabel: countResult.ok
            ? `${countResult.count.toLocaleString("ko-KR")}개의 리뷰`
            : "리뷰를 불러오지 못했어요",
          count: countResult.ok ? countResult.count : null,
        });
        return;
      }
      const reviews = reviewsResult.data.reviews;
      const rate = reviews.length > 0 && !reviewsResult.data.hasNext
        ? reviews.reduce((sum, review) => sum + review.rate, 0) / reviews.length
        : product.reviewRate;
      const countLabel = countResult.ok && countResult.count >= reviews.length
        ? `${countResult.count.toLocaleString("ko-KR")}개의 리뷰`
        : reviewsResult.data.hasNext
          ? `${reviews.length.toLocaleString("ko-KR")}개 이상의 리뷰`
          : `${reviews.length.toLocaleString("ko-KR")}개의 리뷰`;
      const count = countResult.ok && countResult.count >= reviews.length
        ? countResult.count
        : reviewsResult.data.hasNext ? null : reviews.length;
      const completeReviews = !reviewsResult.data.hasNext && reviews.length > 0 &&
        (!countResult.ok || countResult.count === reviews.length) ? reviews : null;
      setReviewSummary({ completeReviews, productId: product.productId, rate, countLabel, count });
    });
    return () => controller.abort();
  }, [product.productId, product.reviewRate]);

  const shownReviewRate = reviewSummary?.productId === product.productId
    ? reviewSummary.rate : product.reviewRate;
  const shownReviewCount = reviewSummary?.productId === product.productId
    ? reviewSummary.countLabel : "리뷰를 불러오는 중이에요";
  const hasNoReviews = reviewSummary?.productId === product.productId && reviewSummary.count === 0;
  const completeReviews = reviewSummary?.productId === product.productId ? reviewSummary.completeReviews : null;
  const sections = [
    { id: "product-book-title", label: "도서 정보" },
    ...(product.description?.trim() ? [{ id: "book-description-title", label: "책 소개" }] : []),
    { id: "product-review-title", label: "리뷰" },
    ...(otherBooks.length ? [{ id: "product-author-books", label: "저자의 다른 책" }] : []),
  ];

  return (
    <article className="page-content">
      <DetailCoverHero
        alt={`${product.itemName} 표지`}
        thumbnailUrl={product.thumbnailUrl}
        title={product.itemName}
      />
      <ProductSectionLinks sections={sections} />
      <section aria-labelledby="product-book-title" className="border-b border-hairline pb-7">
        <div className="min-w-0 pt-6">
          <p className="break-words type-caption text-text-tertiary">
            <span className="sr-only">분류 </span>
            {product.category}
          </p>
          <h2 className="mt-2 scroll-mt-16 break-words break-keep type-section text-text-primary" id="product-book-title" tabIndex={-1}>
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
        <div className="flex min-h-11 items-center justify-between gap-3">
          <h2 className="scroll-mt-16 type-title" id="product-review-title" tabIndex={-1}>리뷰</h2>
          {hasNoReviews ? null : <Link className="inline-flex min-h-11 items-center type-body-small font-semibold text-text-secondary" to={`/products/${product.productId}/reviews`}>전체 보기 ›</Link>}
        </div>
        {hasNoReviews ? (
          // A "★ 0.0" here reads as a book rated zero; say there are none yet and who can write one.
          <div className="mt-2 rounded-panel bg-muted px-4 py-4" role="status">
            <p className="type-body-small font-semibold text-text-primary">아직 리뷰가 없어요</p>
            <p className="mt-1 type-caption text-text-secondary">이 책을 구매하면 첫 리뷰를 남길 수 있어요.</p>
          </div>
        ) : (
          <Link className="mt-2 flex min-h-16 items-center justify-between rounded-panel bg-muted px-4 focus-visible:outline-2 focus-visible:outline-primary" to={`/products/${product.productId}/reviews`}>
            <span className="flex items-center gap-2"><span aria-hidden="true" className="text-[#f2b84b]">★</span><strong className="type-heading tabular-nums">{shownReviewRate.toFixed(1)}</strong></span>
            <span aria-live="polite" className="type-body-small text-text-secondary">{shownReviewCount}</span>
          </Link>
        )}
        {completeReviews ? (
          <div className="mt-4 rounded-panel border border-hairline px-4 py-3">
            <ReviewRatingDistribution reviews={completeReviews} />
          </div>
        ) : null}
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
      {otherBooks.length ? <AuthorOtherBooks author={product.author} books={otherBooks} /> : null}
    </article>
  );
}

export function ProductDetailSkeleton({ coverPreview }: { coverPreview?: CoverPreview | null }) {
  if (coverPreview) {
    // Came from a list: draw the cover we already have where the page will put it.
    return (
      <div aria-busy="true" className="page-content">
        <p className="sr-only" role="status">
          도서 정보를 불러오는 중이에요
        </p>
        <DetailCoverHero alt="" thumbnailUrl={coverPreview.thumbnailUrl} title={coverPreview.title} />
        <div aria-hidden="true" className="space-y-3 pt-6">
          <div className="h-4 w-16 rounded bg-muted" />
          <div className="h-7 w-3/4 rounded bg-muted" />
          <div className="h-4 w-1/2 rounded bg-muted" />
          <div className="mt-5 h-6 w-1/4 rounded bg-muted" />
        </div>
      </div>
    );
  }

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
