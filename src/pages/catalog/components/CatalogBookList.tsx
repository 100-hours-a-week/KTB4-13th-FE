import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import { BookCover } from "@/common/components/BookCover";
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
      <p className="type-body-small font-bold text-text-primary">
        {priceFormatter.format(price)}원
      </p>
      {originalPrice !== null ? (
        <p className="type-caption text-text-tertiary line-through">
          {priceFormatter.format(originalPrice)}원
        </p>
      ) : null}
    </div>
  );
}

function CatalogBookRow({
  book,
  rank,
}: {
  book: CatalogBookItem;
  rank?: number;
}) {
  const row = (
    <article className="flex gap-4 py-3">
      <div className="relative w-[4.5rem] shrink-0">
        <BookCover alt="" thumbnailUrl={book.thumbnailUrl} />
        {rank !== undefined ? (
          <span
            className={`absolute left-1 top-1 flex min-h-6 min-w-6 items-center justify-center rounded-control px-1 text-xs font-bold ${
              rank <= 3
                ? "bg-accent text-white"
                : "border border-border bg-surface text-text-primary"
            }`}
          >
            {rank}
            <span className="sr-only">위</span>
          </span>
        ) : null}
      </div>
      <div className="min-w-0 flex-1 self-center">
        <h2 className="line-clamp-2 type-title text-text-primary">
          {book.title}
        </h2>
        <p className="mt-1 truncate type-body-small text-text-secondary">
          {book.author ?? "저자 정보 없음"}
        </p>
        {book.price !== null ? (
          <div className="mt-2">
            <BookPrice originalPrice={book.originalPrice} price={book.price} />
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
      aria-label={`${book.title} 상세 보기`}
      className="block rounded-control transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      to={`/products/${book.productId}`}
    >
      {row}
    </Link>
  );
}

export function CatalogBookList({
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
        <div aria-hidden="true" className="divide-y divide-border">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <div className="flex gap-4 py-3" key={index}>
              <div className="aspect-[3/4] w-[4.5rem] shrink-0 rounded-control bg-muted" />
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
    return (
      <section
        aria-live="polite"
        className="page-content flex min-h-64 flex-col items-center justify-center gap-2 py-12 text-center"
      >
        <h2 className="type-title text-text-primary">
          {mode === "recommendation"
            ? "추천 도서를 준비하고 있어요"
            : "조건에 맞는 책이 없어요"}
        </h2>
        <p className="type-body-small text-text-secondary">
          {mode === "recommendation"
            ? "조금만 기다리면 더 많은 추천 도서를 만나볼 수 있어요"
            : "다른 도서종류를 선택해 보세요"}
        </p>
      </section>
    );
  }

  return (
    <div className="page-content pb-6">
      <ol aria-label={mode === "ranking" ? "책 랭킹 목록" : "추천 도서 목록"}>
        {items.map((book, index) => (
          <li className="border-b border-border last:border-b-0" key={book.key}>
            <CatalogBookRow
              book={book}
              rank={mode === "ranking" ? index + 1 : undefined}
            />
          </li>
        ))}
      </ol>

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
