import { useEffect, useRef, useState } from "react";
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
const AUTO_ADVANCE_MS = 3500;

function CoverflowRecommendations({
  books,
  onProductClick,
}: {
  books: RecommendationFeedItem[];
  onProductClick: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || books.length <= 1) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActiveIndex((current) => (current + 1) % books.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [books.length, paused, reducedMotion]);
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
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
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
        className="relative left-1/2 h-[310px] w-[calc(100vw-24px)] max-w-[1100px] -translate-x-1/2 overflow-hidden sm:h-[430px]"
        style={{ perspective: "1300px" }}
      >
        {books.map((book, index) => {
          const forward = (index - activeIndex + books.length) % books.length;
          const backward = forward - books.length;
          const distance = Math.abs(forward) <= Math.abs(backward) ? forward : backward;
          const isActive = distance === 0;
          const visible = Math.abs(distance) <= 3;
          const offset = Math.sign(distance) * (Math.abs(distance) === 1 ? 80 : Math.abs(distance) === 2 ? 149 : 205);
          return (
            <button
              aria-label={isActive ? `${book.title}, 현재 선택됨` : `${book.title} 선택`}
              aria-pressed={isActive}
              className="absolute left-1/2 top-5 w-[155px] origin-center cursor-pointer rounded-cover outline-offset-4 transition-[transform,opacity,filter] duration-700 ease-in-out focus-visible:outline-2 focus-visible:outline-primary sm:top-8 sm:w-[245px]"
              key={book.bookId}
              onClick={() => {
                if (!isActive) setActiveIndex(index);
              }}
              style={{
                opacity: visible ? (isActive ? 1 : Math.max(0.42, 0.95 - Math.abs(distance) * 0.14)) : 0,
                pointerEvents: visible ? "auto" : "none",
                transform: `translateX(-50%) translateX(${offset}%) translateZ(${isActive ? 85 : -Math.abs(distance) * 65}px) rotateY(${distance === 0 ? 0 : distance < 0 ? 38 : -38}deg) scale(${isActive ? 1 : Math.max(0.68, 1 - Math.abs(distance) * 0.10)})`,
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

      <div className="mt-5 flex min-h-24 flex-col items-center gap-2 px-5 text-center">
        {activeBook.productId !== null ? (
          <Link
            className="max-w-full rounded-cover text-xl font-bold text-text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-primary"
            onClick={onProductClick}
            to={`/products/${activeBook.productId}`}
          >
            {activeBook.title}
          </Link>
        ) : (
          <p className="text-xl font-bold text-text-primary">{activeBook.title}</p>
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
