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
const ANIMATION_MS = 900;
const MIN_CYLINDER_SLOTS = 18;

function wrapAngle(angle: number) {
  return ((angle + 180) % 360 + 360) % 360 - 180;
}

function wrapIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

export function CoverflowRecommendations({
  books,
  onProductClick,
}: {
  books: RecommendationFeedItem[];
  onProductClick: () => void;
}) {
  const [activeSlot, setActiveSlot] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rotationRef = useRef(0);
  const activeSlotRef = useRef(0);
  const animationRef = useRef<{ from: number; startedAt: number | null; to: number } | null>(null);
  const slotCount = books.length === 1
    ? 1
    : Math.ceil(MIN_CYLINDER_SLOTS / books.length) * books.length;
  const angleStep = 360 / slotCount;
  const activeIndex = activeSlot % books.length;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    let frame = 0;
    let previousTime = 0;
    let lastRotation = rotationRef.current;

    const render = (rotation: number) => {
      if (wheelRef.current) {
        wheelRef.current.style.transform = `translateZ(calc(-1 * var(--cylinder-radius))) rotateY(${-rotation}deg)`;
      }
      cardRefs.current.forEach((card, slot) => {
        if (!card) return;
        const distance = Math.abs(wrapAngle(slot * angleStep - rotation));
        const depth = distance / 180;
        card.style.opacity = String(1 - depth * 0.84);
        card.style.transform = `scale(${1 - depth * 0.31})`;
        card.style.zIndex = String(200 - Math.round(distance));
        card.style.pointerEvents = distance < angleStep * 3.5 ? "auto" : "none";
      });
      const next = wrapIndex(Math.round(rotation / angleStep), slotCount);
      if (next !== activeSlotRef.current) {
        activeSlotRef.current = next;
        setActiveSlot(next);
      }
    };

    const tick = (time: number) => {
      const elapsed = previousTime ? Math.min(time - previousTime, 50) : 0;
      previousTime = time;
      const animation = animationRef.current;
      if (animation) {
        if (animation.startedAt === null) animation.startedAt = time;
        const progress = Math.min(1, (time - animation.startedAt) / ANIMATION_MS);
        const eased = 1 - Math.pow(1 - progress, 3);
        rotationRef.current = animation.from + (animation.to - animation.from) * eased;
        if (progress === 1) animationRef.current = null;
      } else if (!paused && !reducedMotion && !document.hidden && books.length > 1) {
        rotationRef.current += (elapsed * angleStep) / AUTO_ADVANCE_MS;
      }
      if (rotationRef.current !== lastRotation) {
        render(rotationRef.current);
        lastRotation = rotationRef.current;
      }
      frame = window.requestAnimationFrame(tick);
    };

    render(rotationRef.current);
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [angleStep, books.length, paused, reducedMotion, slotCount]);
  const activeBook = books[activeIndex] ?? books[0];

  const move = (direction: number) => {
    const nextStep = Math.round(rotationRef.current / angleStep) + direction;
    const target = nextStep * angleStep;
    if (reducedMotion) {
      rotationRef.current = target;
      animationRef.current = null;
      activeSlotRef.current = wrapIndex(nextStep, slotCount);
      setActiveSlot(activeSlotRef.current);
      return;
    }
    animationRef.current = { from: rotationRef.current, startedAt: null, to: target };
  };

  const selectBook = (slot: number) => {
    const forward = wrapIndex(slot - activeSlot, slotCount);
    const backward = forward - slotCount;
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
      className="-mx-5 w-[calc(100%+2.5rem)] min-w-0 overflow-x-clip [--book-width:110px] [--book-height:165px] [--cylinder-radius:350px] sm:[--book-width:130px] sm:[--book-height:195px] sm:[--cylinder-radius:420px]"
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
        className="relative flex h-[220px] w-full min-w-0 items-center justify-center overflow-visible sm:h-[260px]"
        style={{ perspective: "1200px", perspectiveOrigin: "50% 30%" }}
      >
        <div aria-hidden="true" className="pointer-events-none absolute bottom-3 left-1/2 h-8 w-[85%] -translate-x-1/2 rounded-full bg-black/10 blur-xl" />
        <div
          className="relative h-[var(--book-height)] w-[var(--book-width)]"
          ref={wheelRef}
          style={{ transformStyle: "preserve-3d" }}
        >
          {Array.from({ length: slotCount }, (_, slot) => {
            const book = books[slot % books.length];
            const angle = slot * angleStep;
            const isActive = slot === activeSlot;
            const distance = Math.abs(wrapAngle(angle - activeSlot * angleStep));
            return (
              <div
                className="absolute inset-0"
                key={`${book.bookId}-${slot}`}
                style={{
                  transform: `rotateY(${angle}deg) translateZ(var(--cylinder-radius))`,
                  transformStyle: "preserve-3d",
                }}
              >
                <div className="relative size-full" ref={(node) => { cardRefs.current[slot] = node; }} style={{ transformStyle: "preserve-3d" }}>
                  <button
                    aria-label={isActive ? `${book.title}, 현재 선택됨` : `${book.title} 선택`}
                    aria-pressed={isActive}
                    className="absolute inset-0 cursor-pointer rounded-cover outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
                    onClick={() => { if (!isActive) selectBook(slot); }}
                    style={{ backfaceVisibility: "hidden" }}
                    tabIndex={distance <= angleStep * 3 ? 0 : -1}
                    type="button"
                  >
                    <span aria-hidden="true" className="pointer-events-none absolute -bottom-4 left-[5%] h-8 w-[90%] rounded-full bg-black/20 blur-xl" />
                    <div className="relative size-full overflow-hidden rounded-cover bg-muted shadow-[0_12px_24px_-8px_rgba(0,0,0,0.35)] [&>div]:!h-full [&>div]:!aspect-auto">
                      <BookCover alt={book.title} fallbackTitle={book.title} radius="cover" thumbnailUrl={book.coverUrl} />
                      <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/5" />
                    </div>
                  </button>
                  <div aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-cover bg-muted shadow-lg [&>div]:!h-full [&>div]:!aspect-auto" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                    <BookCover alt="" fallbackTitle={book.title} radius="cover" thumbnailUrl={book.coverUrl} />
                    <span className="pointer-events-none absolute inset-0 bg-surface/70" />
                  </div>
                </div>
              </div>
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
      className="page-content min-w-0 flex flex-col gap-4 py-8 first:pt-5"
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
