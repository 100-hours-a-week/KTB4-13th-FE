import { useEffect, useRef } from "react";

import { BookCover } from "@/common/components/BookCover";
import { RetryButton } from "@/common/components/RetryButton";
import { Toast } from "@/common/components/Toast";
import type { BookSearchItem } from "@/features/search/types/bookSearch";
import type { SearchResultState } from "@/pages/search/types/search";

const priceFormatter = new Intl.NumberFormat("ko-KR");
const SKELETON_COUNT = 12;

// Search returns bookId only; product detail needs productId, so cards are not links yet.
function SearchResultCard({ item }: { item: BookSearchItem }) {
  return (
    <article className="flex min-w-0 flex-col gap-1.5">
      <BookCover
        alt=""
        fallbackTitle={item.title}
        thumbnailUrl={item.coverUrl}
      />
      <h2 className="line-clamp-2 min-h-10 type-body-small font-semibold text-text-primary">
        {item.title}
      </h2>
      <p className="truncate type-caption text-text-tertiary">
        {item.author ?? "저자 정보 없음"}
      </p>
      {item.price !== null ? (
        <p className="type-body-small font-bold text-text-primary">
          {priceFormatter.format(item.price)}원
        </p>
      ) : null}
    </article>
  );
}

interface SearchResultsContentProps {
  onLoadMore: () => void;
  onRetry: () => void;
  state: SearchResultState;
}

export function SearchResultsContent({
  onLoadMore,
  onRetry,
  state,
}: SearchResultsContentProps) {
  const loadMoreButtonRef = useRef<HTMLButtonElement>(null);
  const isLoadingMore =
    state.kind === "ready" && state.paginationStatus === "loadingMore";
  const hasLoadMoreError =
    state.kind === "ready" && state.paginationStatus === "error";

  useEffect(() => {
    const button = loadMoreButtonRef.current;

    if (!button || hasLoadMoreError || isLoadingMore) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        onLoadMore();
      }
    });

    observer.observe(button);
    return () => observer.disconnect();
  }, [hasLoadMoreError, isLoadingMore, onLoadMore]);

  if (state.kind === "idle") {
    return (
      <section className="page-content flex min-h-64 flex-col items-center justify-center gap-2 py-12 text-center">
        <h2 className="type-title text-text-primary">
          찾고 싶은 책을 검색해 보세요
        </h2>
        <p className="type-body-small text-text-secondary">
          책 제목이나 저자를 입력하면 검색 결과를 확인할 수 있어요
        </p>
      </section>
    );
  }

  if (state.kind === "loading") {
    return (
      <div aria-busy="true" className="page-content py-4">
        <p className="sr-only" role="status">
          검색 결과를 불러오는 중이에요
        </p>
        <div aria-hidden="true" className="grid grid-cols-3 gap-x-3 gap-y-6">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <div className="space-y-2" key={index}>
              <div className="aspect-[3/4] rounded-control bg-muted" />
              <div className="h-4 rounded bg-muted" />
              <div className="h-3 w-2/3 rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="page-content py-6">
        <Toast action={<RetryButton onClick={onRetry} />} variant="error">
          검색 결과를 불러오지 못했어요
        </Toast>
      </div>
    );
  }

  if (state.kind === "empty") {
    return (
      <section
        aria-live="polite"
        className="page-content flex min-h-64 flex-col items-center justify-center gap-2 py-12 text-center"
      >
        <h2 className="type-title text-text-primary">검색 결과가 없어요</h2>
        <p className="type-body-small text-text-secondary">
          {state.fallbackMessage ??
            "조건에 맞는 책을 찾지 못했어요. 다른 표현으로 검색해 주세요!"}
        </p>
      </section>
    );
  }

  return (
    <div className="page-content pb-6 pt-4">
      <ul
        aria-label="검색된 도서 목록"
        className="grid grid-cols-3 gap-x-3 gap-y-6"
      >
        {state.items.map((item) => (
          <li className="min-w-0" key={item.bookId}>
            <SearchResultCard item={item} />
          </li>
        ))}
      </ul>

      {state.nextCursor !== null ? (
        <div aria-live="polite" className="flex flex-col items-center gap-2 pt-6">
          {state.paginationStatus === "error" ? (
            <p className="type-body-small text-error">
              검색 결과를 더 불러오지 못했어요
            </p>
          ) : null}
          <button
            className="min-h-11 rounded-control px-4 type-body-small font-semibold text-text-secondary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:text-text-tertiary"
            disabled={state.paginationStatus === "loadingMore"}
            onClick={onLoadMore}
            ref={loadMoreButtonRef}
            type="button"
          >
            {state.paginationStatus === "loadingMore"
              ? "검색 결과를 더 불러오는 중이에요"
              : state.paginationStatus === "error"
                ? "다시 불러오기"
                : "결과 더 보기"}
          </button>
        </div>
      ) : (
        <p
          className="pt-8 text-center type-body-small text-text-secondary"
          role="status"
        >
          검색결과를 모두 확인했어요
        </p>
      )}
    </div>
  );
}
