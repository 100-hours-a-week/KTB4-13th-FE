import { useRef, useState } from "react";
import { Link } from "react-router-dom";

import { BookCover } from "@/common/components/BookCover";
import { ProductAvailabilityBadge } from "@/common/components/ProductAvailabilityBadge";
import { RetryButton } from "@/common/components/RetryButton";
import { Toast } from "@/common/components/Toast";
import type { RecommendationFeedItem } from "@/features/recommendation/types/recommendationFeed";
import { HomeSectionHeader } from "@/pages/home/components/HomeSectionHeader";
import { useHomeRecommendations } from "@/pages/home/hooks/useHomeRecommendations";

interface RecommendationSectionProps {
  onMoreClick: () => void;
  onProductClick: () => void;
}

const priceFormatter = new Intl.NumberFormat("ko-KR");
const SKELETON_COUNT = 3;
const SWIPE_THRESHOLD = 40;

function CoverflowRecommendations({
  books,
  onProductClick,
}: {
  books: RecommendationFeedItem[];
  onProductClick: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const activeBook = books[activeIndex] ?? books[0];

  const move = (direction: number) => {
    setActiveIndex((current) => (current + direction + books.length) % books.length);
  };

  const finishSwipe = (endX: number) => {
    if (touchStartX.current === null) return;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) >= SWIPE_THRESHOLD) move(delta < 0 ? 1 : -1);
  };

  return (
    <div
      aria-label="추천 도서 캐러셀"
      aria-roledescription="캐러셀"
      className="w-full"
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          move(-1);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          move(1);
        }
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (event.changedTouches[0]) finishSwipe(event.changedTouches[0].clientX);
      }}
      onTouchCancel={() => {
        touchStartX.current = null;
      }}
      role="region"
      tabIndex={0}
    >
      <div
        className="relative mx-auto h-[270px] w-full overflow-hidden sm:h-[340px]"
        style={{ perspective: "1100px" }}
      >
        {books.map((book, index) => {
          const forward = (index - activeIndex + books.length) % books.length;
          const backward = forward - books.length;
          const distance = Math.abs(forward) <= Math.abs(backward) ? forward : backward;
          const isActive = distance === 0;
          const visible = Math.abs(distance) <= 3;
          const offset = Math.sign(distance) * (Math.abs(distance) === 1 ? 70 : Math.abs(distance) === 2 ? 122 : 155);
          return (
            <button
              aria-label={isActive ? `${book.title}, 현재 선택됨` : `${book.title} 선택`}
              aria-pressed={isActive}
              className="absolute left-1/2 top-3 w-[146px] origin-center cursor-pointer rounded-cover outline-offset-4 transition-[transform,opacity,filter] duration-500 ease-out focus-visible:outline-2 focus-visible:outline-primary sm:top-5 sm:w-[190px]"
              key={book.bookId}
              onClick={() => {
                if (!isActive) setActiveIndex(index);
              }}
              style={{
                opacity: visible ? (isActive ? 1 : Math.max(0.32, 0.83 - Math.abs(distance) * 0.2)) : 0,
                pointerEvents: visible ? "auto" : "none",
                transform: `translateX(-50%) translateX(${offset}%) translateZ(${isActive ? 75 : -Math.abs(distance) * 75}px) rotateY(${distance === 0 ? 0 : distance < 0 ? 32 : -32}deg) scale(${isActive ? 1 : Math.max(0.68, 1 - Math.abs(distance) * 0.1)})`,
                zIndex: books.length - Math.abs(distance),
              }}
              tabIndex={visible ? 0 : -1}
              type="button"
            >
              <div className="aspect-[3/4] overflow-hidden rounded-cover bg-muted shadow-[0_18px_36px_rgba(0,0,0,0.16)]">
                <BookCover alt={book.title} fallbackTitle={book.title} radius="cover" thumbnailUrl={book.coverUrl} />
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-1 flex items-center justify-center gap-4">
        <button
          aria-label="이전 추천 도서"
          className="rounded-full border border-hairline px-3 py-2 text-text-primary disabled:opacity-40"
          disabled={books.length <= 1}
          onClick={() => move(-1)}
          type="button"
        >
          ←
        </button>
        <span aria-live="polite" className="type-body-small tabular-nums text-text-secondary">
          {activeIndex + 1} / {books.length}
        </span>
        <button
          aria-label="다음 추천 도서"
          className="rounded-full border border-hairline px-3 py-2 text-text-primary disabled:opacity-40"
          disabled={books.length <= 1}
          onClick={() => move(1)}
          type="button"
        >
          →
        </button>
      </div>

      <div className="mt-4 flex min-h-20 flex-col items-center gap-1 px-5 text-center">
        {activeBook.productId !== null ? (
          <Link
            className="max-w-full rounded-cover type-body font-semibold text-text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-primary"
            onClick={onProductClick}
            to={`/products/${activeBook.productId}`}
          >
            {activeBook.title}
          </Link>
        ) : (
          <p className="type-body font-semibold text-text-primary">{activeBook.title}</p>
        )}
        {activeBook.author ? (
          <p className="type-body-small text-text-secondary">{activeBook.author}</p>
        ) : null}
        {activeBook.price !== null ? (
          <p className="type-body-small tabular-nums text-text-secondary">
            {priceFormatter.format(activeBook.price)}원
          </p>
        ) : null}
        {activeBook.productId === null ? <ProductAvailabilityBadge /> : null}
      </div>
    </div>
  );
}

export function RecommendationSection({
  onMoreClick,
  onProductClick,
}: RecommendationSectionProps) {
  const { recommendations, retry } = useHomeRecommendations();

  return (
    <section
      aria-labelledby="book-recommendation-title"
      className="page-content flex flex-col gap-4 py-8 first:pt-5"
    >
      <HomeSectionHeader
        id="book-recommendation-title"
        onMoreClick={onMoreClick}
        title="이런 책 어때요?"
      />

      {recommendations.kind === "loading" ? (
        <div aria-busy="true">
          <p className="sr-only" role="status">추천 도서를 불러오는 중이에요</p>
          <div aria-hidden="true" className="flex justify-center gap-4 overflow-hidden">
            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <div className="w-[30%] shrink-0" key={index}>
                <div className="aspect-[3/4] rounded-cover bg-muted" />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {recommendations.kind === "error" ? (
        <Toast action={<RetryButton onClick={retry} />} variant="error">
          추천 도서를 불러오지 못했어요
        </Toast>
      ) : null}

      {recommendations.kind === "ready" && recommendations.items.length === 0 ? (
        <p className="py-6 text-center type-body-small text-text-secondary">
          아직 추천할 도서가 없어요
        </p>
      ) : null}

      {recommendations.kind === "ready" && recommendations.items.length > 0 ? (
        <CoverflowRecommendations
          books={recommendations.items}
          onProductClick={onProductClick}
        />
      ) : null}
    </section>
  );
}
