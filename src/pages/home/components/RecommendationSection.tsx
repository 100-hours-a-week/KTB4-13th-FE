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
const ANIMATION_MS = 1050;

function CoverflowRecommendations({
  books,
  onProductClick,
}: {
  books: RecommendationFeedItem[];
  onProductClick: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [rotationStep, setRotationStep] = useState(0);
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
      if (!document.hidden) {
        setRotationStep((current) => current + 1);
        setActiveIndex((current) => (current + 1) % books.length);
      }
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [books.length, paused, reducedMotion]);
  const activeBook = books[activeIndex] ?? books[0];

  const move = (direction: number) => {
    setRotationStep((current) => current + direction);
    setActiveIndex((current) => (current + direction + books.length) % books.length);
  };

  const selectBook = (index: number) => {
    const forward = (index - activeIndex + books.length) % books.length;
    const backward = forward - books.length;
    const shortest = Math.abs(forward) <= Math.abs(backward) ? forward : backward;
    if (shortest !== 0) move(shortest);
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
        className="relative left-1/2 h-[245px] w-[calc(100vw-8px)] max-w-[1000px] -translate-x-1/2 overflow-hidden sm:h-[330px]"
        style={{ perspective: "950px", perspectiveOrigin: "50% 43%", ["--coverflow-radius" as string]: "clamp(145px, 39vw, 320px)" }}
      >
        <div aria-hidden="true" className="pointer-events-none absolute bottom-3 left-1/2 h-10 w-[72%] max-w-[560px] -translate-x-1/2 rounded-full bg-black/10 blur-2xl" />
        <div className="absolute inset-0" style={{
          transformStyle: "preserve-3d",
          transform: `translateZ(calc(-1 * var(--coverflow-radius))) rotateY(${-rotationStep * (360 / books.length)}deg)`,
          transition: reducedMotion ? "none" : `transform ${ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        }}>
          {books.map((book, index) => {
            const angle = index * (360 / books.length);
            const forward = (index - activeIndex + books.length) % books.length;
            const backward = forward - books.length;
            const distance = Math.abs(forward) <= Math.abs(backward) ? forward : backward;
            const isActive = index === activeIndex;
            return (
              <button
                aria-label={isActive ? `${book.title}, 현재 선택됨` : `${book.title} 선택`}
                aria-pressed={isActive}
                className="absolute left-1/2 top-5 w-[98px] cursor-pointer rounded-cover outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary sm:top-6 sm:w-[170px]"
                key={book.bookId}
                onClick={() => { if (!isActive) selectBook(index); }}
                style={{
                  transform: `translateX(-50%) rotateY(${angle}deg) translateZ(var(--coverflow-radius))`,
                  backfaceVisibility: "visible",
                  pointerEvents: Math.abs(distance) <= 3 ? "auto" : "none",
                }}
                tabIndex={Math.abs(distance) <= 3 ? 0 : -1}
                type="button"
              >
                <span aria-hidden="true" className="pointer-events-none absolute -bottom-5 left-[5%] h-9 w-[90%] rounded-full bg-black/20 blur-xl" />
                <span aria-hidden="true" className="pointer-events-none absolute inset-y-[16%] -left-[8%] w-[116%] rounded-cover bg-neutral-500/15 blur-[2px]" />
                <div className="relative aspect-[3/4] overflow-hidden rounded-cover bg-muted shadow-[0_12px_22px_rgba(0,0,0,0.16),0_3px_7px_rgba(0,0,0,0.09)]">
                  <BookCover alt={book.title} fallbackTitle={book.title} radius="cover" thumbnailUrl={book.coverUrl} />
                </div>
              </button>
            );
          })}
        </div>
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
