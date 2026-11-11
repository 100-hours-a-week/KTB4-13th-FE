import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import { QuickAddToCartButton } from "@/features/cart/components/QuickAddToCartButton";
import { displayBookTitle } from "@/common/lib/bookTitle";
import { BookCover } from "@/common/components/BookCover";
import { useCoverLinkClick } from "@/common/lib/coverTransition";
import { ProductAvailabilityBadge } from "@/common/components/ProductAvailabilityBadge";
import { RetryButton } from "@/common/components/RetryButton";
import { Toast } from "@/common/components/Toast";
import type { CatalogListStatus } from "@/pages/catalog/hooks/useCatalogBooks";
import type {
  CatalogBookItem,
  CatalogMode,
} from "@/pages/catalog/types/catalog";

const priceFormatter = new Intl.NumberFormat("ko-KR");
const SKELETON_COUNT = 5;

interface CatalogBookListProps {
  hasActiveFilters: boolean;
  hasLoadMoreError: boolean;
  items: CatalogBookItem[];
  mode: CatalogMode;
  nextCursor: string | null;
  onLoadMore: () => void;
  onRetry: () => void;
  status: CatalogListStatus;
}

function BookPrice({ price, originalPrice }: { originalPrice: number | null; price: number }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      <p className="type-body-small font-semibold tabular-nums text-text-primary">
        {priceFormatter.format(price)}원
      </p>
      {originalPrice !== null ? (
        <p className="type-caption tabular-nums text-text-tertiary line-through">
          {priceFormatter.format(originalPrice)}원
        </p>
      ) : null}
    </div>
  );
}

const TOP_RANK_COUNT = 3;

// Ranks share one row shape; the top three get an accent numeral and first place a slightly larger
// cover and title. The + sits on the cover corner, outside the link, since a button cannot nest in a
// link. The title link stretches over the whole row.
function RankingBookRow({
  book,
  priority,
  rank,
}: {
  book: CatalogBookItem;
  priority: boolean;
  rank: number;
}) {
  const onCoverLinkClick = useCoverLinkClick();
  const { productId } = book;
  const isFirst = rank === 1;
  const isTop = rank <= TOP_RANK_COUNT;

  return (
    <li className="book-lift relative flex items-center gap-4 py-3">
      <span
        aria-hidden="true"
        className={`w-6 shrink-0 text-center type-numeral ${isFirst ? "text-2xl" : "text-xl"} ${
          isTop ? "text-accent" : "text-text-tertiary"
        }`}
      >
        {rank}
      </span>
      <div className={`relative shrink-0 ${isFirst ? "w-[5.5rem]" : "w-[4.75rem]"}`}>
        <div className="book-lift-cover rounded-cover">
          <BookCover alt="" fallbackTitle={book.title} priority={priority} radius="cover" thumbnailUrl={book.thumbnailUrl} />
        </div>
        {productId !== null ? (
          <QuickAddToCartButton
            className="absolute -bottom-1.5 -right-1.5 z-10"
            productId={productId}
            thumbnailUrl={book.thumbnailUrl}
            title={book.title}
            variant="icon-small"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <h2
          className={`line-clamp-2 break-keep text-text-primary ${isFirst ? "type-title" : "type-body font-semibold"}`}
        >
          {productId !== null ? (
            <Link
              aria-label={`${rank}위, ${displayBookTitle(book.title)} 상세 보기`}
              className="after:absolute after:inset-0 after:rounded-control focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-primary"
              onClick={(event) =>
                onCoverLinkClick(event, `/products/${productId}`, { thumbnailUrl: book.thumbnailUrl, title: book.title })
              }
              to={`/products/${productId}`}
            >
              {displayBookTitle(book.title)}
            </Link>
          ) : (
            <>
              <span className="sr-only">{rank}위, </span>
              {displayBookTitle(book.title)}
            </>
          )}
        </h2>
        <p className="mt-0.5 truncate type-caption text-text-secondary">
          {book.author ?? "저자 정보 없음"}
        </p>
        {book.review !== null ? (
          <p className="mt-1 flex items-center gap-1 type-caption font-semibold text-accent">
            <span aria-hidden="true">★</span>
            <span className="tabular-nums">
              {book.review.rate.toFixed(1)} ({book.review.count.toLocaleString("ko-KR")})
            </span>
            <span className="sr-only">점, 리뷰 {book.review.count}건</span>
          </p>
        ) : null}
        {book.price !== null ? (
          <div className="mt-1.5">
            <BookPrice originalPrice={book.originalPrice} price={book.price} />
          </div>
        ) : null}
        {productId === null ? (
          <div className="mt-1.5 flex">
            <ProductAvailabilityBadge />
          </div>
        ) : null}
      </div>
    </li>
  );
}

function CatalogBookRow({
  book,
  priority,
}: {
  book: CatalogBookItem;
  priority: boolean;
}) {
  const onCoverLinkClick = useCoverLinkClick();
  const row = (
    <article className="flex gap-4 py-4">
      <div className="w-[4.5rem] shrink-0">
        <BookCover
          alt=""
          fallbackTitle={book.title}
          priority={priority}
          radius="cover"
          thumbnailUrl={book.thumbnailUrl}
        />
      </div>
      <div className="min-w-0 flex-1 self-center">
        <h2 className="line-clamp-2 type-title text-text-primary">
          {displayBookTitle(book.title)}
        </h2>
        <p className="mt-1 truncate type-body-small text-text-secondary">
          {book.author ?? "저자 정보 없음"}
        </p>
        {book.matchScore !== null ? (
          <p className="mt-1 type-caption tabular-nums text-text-secondary">
            취향 매칭 {book.matchScore}%
          </p>
        ) : null}
        {book.price !== null ? (
          <div className="mt-2">
            <BookPrice originalPrice={book.originalPrice} price={book.price} />
          </div>
        ) : null}
        {book.productId === null ? (
          <div className="mt-1.5 flex">
            <ProductAvailabilityBadge />
          </div>
        ) : null}
      </div>
    </article>
  );

  if (book.productId === null) {
    return row;
  }

  return (
    <Link
      aria-label={`${displayBookTitle(book.title)} 상세 보기`}
      className="block hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      onClick={(event) =>
        onCoverLinkClick(event, `/products/${book.productId}`, { thumbnailUrl: book.thumbnailUrl, title: book.title })
      }
      to={`/products/${book.productId}`}
    >
      {row}
    </Link>
  );
}

export function CatalogBookList({
  hasActiveFilters,
  hasLoadMoreError,
  items,
  mode,
  nextCursor,
  onLoadMore,
  onRetry,
  status,
}: CatalogBookListProps) {
  const loadMoreButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = loadMoreButtonRef.current;

    if (!button || hasLoadMoreError || status === "loadingMore") {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        onLoadMore();
      }
    });

    observer.observe(button);
    return () => observer.disconnect();
  }, [hasLoadMoreError, onLoadMore, status]);

  if (status === "loading") {
    return (
      <div aria-busy="true" className="page-content py-2">
        <p className="sr-only" role="status">
          도서 목록을 불러오는 중이에요
        </p>
        <div aria-hidden="true" className={mode === "ranking" ? "" : "divide-y divide-hairline"}>
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <div className={`flex gap-4 ${mode === "ranking" ? "py-3" : "py-4"}`} key={index}>
              {mode === "ranking" ? (
                <div className="h-6 w-6 shrink-0 self-center rounded-cover bg-muted" />
              ) : null}
              <div
                className={`aspect-[3/4] shrink-0 rounded-cover bg-muted ${mode === "ranking" ? "w-[4.75rem]" : "w-[4.5rem]"}`}
              />
              <div className="flex flex-1 flex-col justify-center gap-2">
                <div className="h-5 w-3/4 rounded bg-muted" />
                <div className="h-4 w-1/3 rounded bg-muted" />
                <div className="h-4 w-1/4 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="page-content py-6" role="alert">
        <Toast action={<RetryButton onClick={onRetry} />} variant="error">
          책 목록을 불러오지 못했어요
        </Toast>
      </div>
    );
  }

  if (items.length === 0) {
    const isFilteredRecommendation = mode === "recommendation" && hasActiveFilters;

    return (
      <section
        aria-live="polite"
        className="page-content flex min-h-64 flex-col items-center justify-center gap-2 py-12 text-center"
      >
        <h2 className="type-title text-text-primary">
          {isFilteredRecommendation
            ? "조건에 맞는 추천 도서가 없어요"
            : mode === "recommendation"
              ? "추천 도서를 준비하고 있어요"
              : "조건에 맞는 책이 없어요"}
        </h2>
        <p className="type-body-small text-text-secondary">
          {isFilteredRecommendation
            ? "매칭도나 출간연도 조건을 조정해보세요"
            : mode === "recommendation"
              ? "조금만 기다리면 더 많은 추천 도서를 만나볼 수 있어요"
              : "다른 도서종류를 선택해 보세요"}
        </p>
      </section>
    );
  }

  return (
    <div className="page-content pb-6">
      {mode === "ranking" ? (
        <ol aria-label="책 랭킹 목록" className="pt-1">
          {items.map((book, index) => (
            <RankingBookRow book={book} key={book.key} priority={index === 0} rank={index + 1} />
          ))}
        </ol>
      ) : (
        <ol aria-label="추천 도서 목록">
          {items.map((book, index) => (
            <li className="border-b border-hairline last:border-b-0" key={book.key}>
              <CatalogBookRow book={book} priority={index === 0} />
            </li>
          ))}
        </ol>
      )}

      {nextCursor !== null ? (
        <div aria-live="polite" className="flex flex-col items-center gap-2 pt-4">
          {hasLoadMoreError ? (
            <p className="type-body-small text-error">
              목록을 더 불러오지 못했어요
            </p>
          ) : null}
          <button
            className="min-h-11 rounded-control px-4 type-body-small font-semibold text-text-secondary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:text-text-tertiary"
            disabled={status === "loadingMore"}
            onClick={onLoadMore}
            ref={loadMoreButtonRef}
            type="button"
          >
            {status === "loadingMore"
              ? "책을 더 불러오는 중이에요"
              : hasLoadMoreError
                ? "다시 불러오기"
                : "책 더 보기"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
