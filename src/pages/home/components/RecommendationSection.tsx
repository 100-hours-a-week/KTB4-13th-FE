import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Link, useNavigate } from "react-router-dom";

import { displayBookTitle } from "@/common/lib/bookTitle";
import { BookCover } from "@/common/components/BookCover";
import { ProductAvailabilityBadge } from "@/common/components/ProductAvailabilityBadge";
import { RetryButton } from "@/common/components/RetryButton";
import { Toast } from "@/common/components/Toast";
import { useRecommendationPreview } from "@/dev/useRecommendationPreview";
import type { RecommendationFeedItem } from "@/features/recommendation/types/recommendationFeed";
import { HomeSectionHeader } from "@/pages/home/components/HomeSectionHeader";
import { useHomeRecommendations } from "@/pages/home/hooks/useHomeRecommendations";

// Dev-only opt-in: an empty or failed feed also shows fixture books so the carousel design can be checked locally.
const SHOW_DEV_PREVIEW =
  import.meta.env.DEV && import.meta.env.VITE_DEV_HOME_RECOMMENDATION_PREVIEW === "true";

interface RecommendationSectionProps {
  onMoreClick: () => void;
  onProductClick: () => void;
}

const priceFormatter = new Intl.NumberFormat("ko-KR");
const SKELETON_COUNT = 3;
const AUTO_HOLD_MS = 1500;
const AUTO_ANIMATION_MS = 900;
const CONTROL_ANIMATION_MS = 240;
const VISIBLE_NEIGHBORS = 3;
const REFERENCE_ANGLE_STEP = 20;
// Movement before a press becomes a drag; below it the press stays a tap on a book.
const DRAG_START_PX = 6;
// Only the last moments of a drag set the release speed, so a finger that stops and lifts does not fling.
const VELOCITY_WINDOW_MS = 80;
// A release keeps travelling as if the finger moved this much longer at the same speed.
const FLING_PROJECTION_MS = 180;
const MAX_FLING_STEPS = 4;
const SETTLE_MAX_MS = 700;
const MIN_FLING_DEG_PER_MS = 0.02;
const CLICK_AFTER_DRAG_MS = 100;

interface DragState {
  axis: "x" | null;
  degreesPerPx: number;
  pointerId: number;
  samples: { time: number; x: number }[];
  startRotation: number;
  startX: number;
  startY: number;
}

function releaseVelocity(samples: DragState["samples"], releasedAt: number) {
  const last = samples[samples.length - 1];
  const first = samples.find((sample) => last.time - sample.time <= VELOCITY_WINDOW_MS) ?? last;
  // Held still before lifting: no fling.
  if (releasedAt - last.time > VELOCITY_WINDOW_MS || last.time === first.time) return 0;
  return (last.x - first.x) / (last.time - first.time);
}

function wrapAngle(angle: number) {
  return ((angle + 180) % 360 + 360) % 360 - 180;
}

function wrapIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

// Every book stays mounted so a fast swipe never re-creates and re-decodes a cover; books past the
// visible neighbours are only hidden, judged from the live rotation rather than the lagging React state.
function updateCoverPosition(
  card: HTMLDivElement,
  shade: HTMLSpanElement | null,
  distance: number,
  visualScale: number,
  angleStep: number,
) {
  const hidden = Math.abs(distance) > (VISIBLE_NEIGHBORS + 0.5) * angleStep;
  card.style.visibility = hidden ? "hidden" : "";
  if (hidden) return;
  const visualDistance = Math.abs(distance) * visualScale;
  card.style.zIndex = String(200 - Math.round(Math.abs(distance)));
  card.style.opacity = String(Math.max(0.15, 1 - visualDistance / 150));
  card.style.transform = `rotateY(${-distance * (1 - visualScale)}deg) scale(${Math.max(0.65, 1.05 - visualDistance / 400)})`;
  if (shade) shade.style.opacity = String(Math.min(0.45, visualDistance / 200));
}

// Memoized so an active-book change during a swipe re-renders only the two slots whose state flips.
const CoverflowSlot = memo(function CoverflowSlot({
  angle,
  book,
  isActive,
  onCardNode,
  onPress,
  onShadeNode,
  slot,
}: {
  angle: number;
  book: RecommendationFeedItem;
  isActive: boolean;
  onCardNode: (slot: number, node: HTMLDivElement | null) => void;
  onPress: (slot: number, isActive: boolean) => void;
  onShadeNode: (slot: number, node: HTMLSpanElement | null) => void;
  slot: number;
}) {
  return (
    <div
      // The turned 3D boxes overlap their neighbours; only the book button should take a tap.
      className="pointer-events-none absolute inset-0"
      style={{
        transform: `rotateY(${angle}deg) translateZ(var(--cylinder-radius))`,
        transformStyle: "preserve-3d",
      }}
    >
      <div
        className="relative size-full"
        ref={(node) => onCardNode(slot, node)}
        style={{ transformStyle: "preserve-3d" }}
      >
        <button
          aria-label={isActive ? `${displayBookTitle(book.title)}, 현재 선택됨` : `${displayBookTitle(book.title)} 선택`}
          aria-pressed={isActive}
          className={`pointer-events-auto absolute inset-0 cursor-pointer rounded-control outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary ${
            isActive ? "book-lift" : ""
          }`}
          data-press="none"
          onClick={() => onPress(slot, isActive)}
          style={{ backfaceVisibility: "hidden" }}
          type="button"
        >
          <div className="book-lift-cover relative size-full overflow-hidden rounded-control bg-muted shadow-[0_14px_30px_-12px_rgba(36,33,31,0.38)] [&>div]:!h-full [&>div]:!aspect-auto [&>div]:!rounded-control [&>div]:!border-transparent">
            <BookCover alt={book.title} fallbackTitle={book.title} priority={isActive} radius="cover" thumbnailUrl={book.coverUrl} />
            {/* Its own layer: the opacity changes every frame of a turn, and without one the whole cover and shadow repaint. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-black will-change-[opacity]"
              ref={(node) => onShadeNode(slot, node)}
            />
          </div>
        </button>
      </div>
    </div>
  );
});

export function CoverflowRecommendations({
  books,
  isPreview = false,
  onProductClick,
}: {
  books: RecommendationFeedItem[];
  // Preview mode keeps display-only items from navigating to product detail.
  isPreview?: boolean;
  onProductClick: () => void;
}) {
  const navigate = useNavigate();
  const [activeSlot, setActiveSlot] = useState(0);
  const dragRef = useRef<DragState | null>(null);
  const draggingRef = useRef(false);
  const suppressClickRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef(true);
  const wheelRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shadeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const rotationRef = useRef(0);
  const activeSlotRef = useRef(0);
  const animationRef = useRef<{ duration: number; from: number; startedAt: number | null; to: number } | null>(null);
  const slotCount = books.length;
  const angleStep = 360 / slotCount;
  const visualAngleScale = Math.min(1, REFERENCE_ANGLE_STEP / angleStep);
  const radiusScale = books.length <= 2
    ? 1
    : Math.min(
        1.15,
        Math.max(
          0.75,
          Math.sin((REFERENCE_ANGLE_STEP * Math.PI) / 180) /
            Math.sin((angleStep * Math.PI) / 180),
        ),
      );
  const activeIndex = activeSlot % books.length;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const observer = new IntersectionObserver(([entry]) => {
      isVisibleRef.current = entry?.isIntersecting ?? false;
    });
    observer.observe(carousel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;
    let lastRotation = rotationRef.current;
    let nextAdvanceAt: number | null = null;

    const render = (rotation: number) => {
      if (wheelRef.current) {
        wheelRef.current.style.transform = `translateZ(calc(-1 * var(--cylinder-radius))) rotateY(${-rotation}deg)`;
      }
      cardRefs.current.forEach((card, slot) => {
        if (!card) return;
        const signedDistance = wrapAngle(slot * angleStep - rotation);
        updateCoverPosition(card, shadeRefs.current[slot], signedDistance, visualAngleScale, angleStep);
      });
      const next = wrapIndex(Math.round(rotation / angleStep), slotCount);
      if (next !== activeSlotRef.current) {
        activeSlotRef.current = next;
        setActiveSlot(next);
      }
    };

    const tick = (time: number) => {
      const animation = animationRef.current;
      if (animation) {
        if (animation.startedAt === null) animation.startedAt = time;
        const progress = Math.min(1, (time - animation.startedAt) / animation.duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        rotationRef.current = animation.from + (animation.to - animation.from) * eased;
        if (progress === 1) {
          animationRef.current = null;
          nextAdvanceAt = time + AUTO_HOLD_MS;
        }
      } else if (
        !paused &&
        !draggingRef.current &&
        !reducedMotion &&
        isVisibleRef.current &&
        !document.hidden &&
        books.length > 1
      ) {
        if (nextAdvanceAt === null) {
          nextAdvanceAt = time + AUTO_HOLD_MS;
        } else if (time >= nextAdvanceAt) {
          const nextStep = Math.round(rotationRef.current / angleStep) + 1;
          animationRef.current = {
            duration: AUTO_ANIMATION_MS,
            from: rotationRef.current,
            startedAt: time,
            to: nextStep * angleStep,
          };
          nextAdvanceAt = null;
        }
      } else {
        nextAdvanceAt = null;
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
  }, [angleStep, books.length, paused, reducedMotion, slotCount, visualAngleScale]);
  const activeBook = books[activeIndex] ?? books[0];

  const animateTo = (target: number) => {
    if (reducedMotion) {
      rotationRef.current = target;
      animationRef.current = null;
      activeSlotRef.current = wrapIndex(Math.round(target / angleStep), slotCount);
      setActiveSlot(activeSlotRef.current);
      return;
    }
    animationRef.current = {
      duration: CONTROL_ANIMATION_MS,
      from: rotationRef.current,
      startedAt: null,
      to: target,
    };
  };

  const move = (direction: number) => {
    // Add to the requested destination so fast taps are all retained.
    const destination = animationRef.current?.to ?? rotationRef.current;
    animateTo((Math.round(destination / angleStep) + direction) * angleStep);
  };

  const selectBook = (slot: number) => {
    const forward = wrapIndex(slot - activeSlot, slotCount);
    const backward = forward - slotCount;
    const shortest = Math.abs(forward) <= Math.abs(backward) ? forward : backward;
    if (shortest !== 0) {
      animateTo((Math.round(rotationRef.current / angleStep) + shortest) * angleStep);
    }
  };

  // Slots are memoized, so they get stable callbacks; the latest press handler is read through a ref.
  const pressBookRef = useRef<(slot: number, isActive: boolean) => void>(() => {});
  useLayoutEffect(() => {
    pressBookRef.current = (slot, isActive) => {
      const book = books[slot];
      if (!isActive) {
        selectBook(slot);
      } else if (!isPreview && book && book.productId !== null) {
        onProductClick();
        navigate(`/products/${book.productId}`);
      }
    };
  });
  const pressBook = useCallback((slot: number, isActive: boolean) => pressBookRef.current(slot, isActive), []);

  const setCardNode = useCallback(
    (slot: number, node: HTMLDivElement | null) => {
      cardRefs.current[slot] = node;
      if (node) {
        updateCoverPosition(node, shadeRefs.current[slot], wrapAngle(slot * angleStep - rotationRef.current), visualAngleScale, angleStep);
      }
    },
    [angleStep, visualAngleScale],
  );
  const setShadeNode = useCallback((slot: number, node: HTMLSpanElement | null) => {
    shadeRefs.current[slot] = node;
  }, []);

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    // A second finger does not take over a drag in progress. A press that never turned into a drag
    // (released outside the wheel, so no pointerup reached it) is simply replaced.
    if (books.length <= 1 || dragRef.current?.axis === "x") return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    // A click swallowed after the previous drag may never have fired; this press is a new gesture.
    suppressClickRef.current = false;
    dragRef.current = {
      axis: null,
      // One book width of drag turns the wheel by one book.
      degreesPerPx: angleStep / Math.max(1, wheelRef.current?.offsetWidth ?? 1),
      pointerId: event.pointerId,
      samples: [{ time: event.timeStamp, x: event.clientX }],
      startRotation: rotationRef.current,
      startX: event.clientX,
      startY: event.clientY,
    };
  };

  const continueDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;

    if (drag.axis === null) {
      const dx = Math.abs(event.clientX - drag.startX);
      const dy = Math.abs(event.clientY - drag.startY);
      if (Math.max(dx, dy) < DRAG_START_PX) return;
      if (dy > dx) {
        // Vertical intent: leave the gesture to page scrolling (touch-action: pan-y).
        dragRef.current = null;
        return;
      }
      drag.axis = "x";
      // Pick up from wherever an automatic turn had reached, without a jump.
      animationRef.current = null;
      drag.startRotation = rotationRef.current;
      drag.startX = event.clientX;
      draggingRef.current = true;
      setIsDragging(true);
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // The pointer may already be gone; the drag still ends on pointerup/cancel.
      }
    }

    rotationRef.current = drag.startRotation - (event.clientX - drag.startX) * drag.degreesPerPx;
    drag.samples.push({ time: event.timeStamp, x: event.clientX });
    while (drag.samples.length > 2 && event.timeStamp - drag.samples[0].time > VELOCITY_WINDOW_MS) {
      drag.samples.shift();
    }
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    dragRef.current = null;
    if (drag.axis !== "x") return;

    draggingRef.current = false;
    setIsDragging(false);
    // The click that follows a mouse drag arrives right after pointerup; touch drags usually send none,
    // so the flag must not outlive this gesture and swallow a later keyboard Enter.
    suppressClickRef.current = true;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, CLICK_AFTER_DRAG_MS);

    const current = rotationRef.current;
    const currentStep = Math.round(current / angleStep);
    if (reducedMotion || cancelled) {
      animateTo(currentStep * angleStep);
      return;
    }

    const degreesPerMs = -releaseVelocity(drag.samples, event.timeStamp) * drag.degreesPerPx;
    const projectedStep = Math.round((current + degreesPerMs * FLING_PROJECTION_MS) / angleStep);
    const targetStep = Math.min(currentStep + MAX_FLING_STEPS, Math.max(currentStep - MAX_FLING_STEPS, projectedStep));
    const target = targetStep * angleStep;
    // The ease-out curve starts at 3x its average speed: size it so the wheel leaves at the finger's speed.
    const duration = Math.abs(degreesPerMs) >= MIN_FLING_DEG_PER_MS
      ? Math.min(SETTLE_MAX_MS, Math.max(CONTROL_ANIMATION_MS, (3 * Math.abs(target - current)) / Math.abs(degreesPerMs)))
      : CONTROL_ANIMATION_MS;
    animationRef.current = { duration, from: current, startedAt: null, to: target };
  };

  return (
    <div
      aria-label="추천 도서 캐러셀"
      aria-roledescription="캐러셀"
      className={`-mx-5 w-[calc(100%+2.5rem)] min-w-0 touch-pan-y select-none overflow-x-clip [--book-width:110px] [--book-height:165px] [--cylinder-radius:calc(350px*var(--radius-scale))] sm:[--book-width:130px] sm:[--book-height:195px] sm:[--cylinder-radius:calc(420px*var(--radius-scale))] ${
        books.length > 1 ? "cursor-grab data-dragging:cursor-grabbing data-dragging:**:cursor-grabbing" : ""
      }`}
      data-dragging={isDragging ? "" : undefined}
      onClickCapture={(event) => {
        if (!suppressClickRef.current) return;
        // The press ended a drag, not a tap on a book.
        suppressClickRef.current = false;
        event.preventDefault();
        event.stopPropagation();
      }}
      onDragStart={(event) => event.preventDefault()}
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
      onPointerCancel={(event) => endDrag(event, true)}
      onPointerDown={startDrag}
      onPointerMove={continueDrag}
      onPointerUp={(event) => endDrag(event, false)}
      ref={carouselRef}
      role="region"
      style={{ ["--radius-scale" as string]: radiusScale }}
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
          {books.map((book, slot) => (
            <CoverflowSlot
              angle={slot * angleStep}
              book={book}
              isActive={slot === activeSlot}
              key={book.bookId}
              onCardNode={setCardNode}
              onPress={pressBook}
              onShadeNode={setShadeNode}
              slot={slot}
            />
          ))}
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

      <div className="mt-5 min-h-24 overflow-hidden px-5 text-center">
        <div
          className="recommendation-info-enter flex flex-col items-center gap-2"
          key={`${activeBook.bookId}-${activeSlot}`}
        >
          {!isPreview && activeBook.productId !== null ? (
            <Link
              className="max-w-full rounded-cover text-xl font-bold text-text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-primary"
              onClick={onProductClick}
              to={`/products/${activeBook.productId}`}
            >
              {displayBookTitle(activeBook.title)}
            </Link>
          ) : (
            <p className="text-xl font-bold text-text-primary">{displayBookTitle(activeBook.title)}</p>
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
    </div>
  );
}

export function RecommendationSection({
  onMoreClick,
  onProductClick,
}: RecommendationSectionProps) {
  const { recommendations, retry } = useHomeRecommendations();
  const previewBooks = useRecommendationPreview(SHOW_DEV_PREVIEW);

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

      {recommendations.kind === "ready" && recommendations.items.length === 0 && !SHOW_DEV_PREVIEW ? (
        <p className="py-6 text-center type-body-small text-text-secondary">
          아직 추천할 도서가 없어요
        </p>
      ) : null}

      {/* The error toast above stays visible; auth failures sign out and unmount this section instead. */}
      {SHOW_DEV_PREVIEW &&
      previewBooks.length > 0 &&
      (recommendations.kind === "error" ||
        (recommendations.kind === "ready" && recommendations.items.length === 0)) ? (
        <div className="flex flex-col gap-3">
          <p className="self-center rounded-full border border-dashed border-border px-3 py-1 type-caption text-text-secondary">
            개발용 미리보기 데이터 · 실제 추천 아님
          </p>
          <CoverflowRecommendations
            books={previewBooks}
            isPreview
            onProductClick={onProductClick}
          />
        </div>
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
