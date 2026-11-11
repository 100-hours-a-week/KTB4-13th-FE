import { Link } from "react-router-dom";

import { QuickAddToCartButton } from "@/features/cart/components/QuickAddToCartButton";
import { BookCover } from "@/common/components/BookCover";
import { useCoverLinkClick } from "@/common/lib/coverTransition";
import { RetryButton } from "@/common/components/RetryButton";
import { Toast } from "@/common/components/Toast";
import type { ProductListItem } from "@/features/product/types/product";
import type { BookRankingState } from "@/pages/home/hooks/useBookRanking";

// Home shows the top five only; the full list lives behind 더보기.
const HOME_RANKING_COUNT = 5;
const MEDIUM_COUNT = 2;
// Card corner for the round + button. Its 44px hit area overhangs the 32px circle, so every tier
// lines the circles up on the same vertical axis.
const CORNER_ADD_CLASS_NAME = "absolute bottom-1 right-1 z-10";

interface BookRankingSectionProps {
  onMoreClick: () => void;
  onProductClick: () => void;
  ranking: BookRankingState;
  retry: () => void;
}

function ReviewLine({ item, tone = "default" }: { item: ProductListItem; tone?: "default" | "inverse" }) {
  const hasRate =
    typeof item.reviewCount === "number" &&
    item.reviewCount > 0 &&
    typeof item.reviewRate === "number" &&
    item.reviewRate > 0;
  const mutedClassName = tone === "inverse" ? "text-white/60" : "text-text-tertiary";

  if (hasRate) {
    return (
      <p className={`flex items-center gap-1 type-caption font-semibold ${tone === "inverse" ? "text-[#f6c3c8]" : "text-[#d96f7a]"}`}>
        <span aria-hidden="true">★</span>
        <span className="tabular-nums">
          {item.reviewRate?.toFixed(1)} ({item.reviewCount?.toLocaleString("ko-KR")})
        </span>
      </p>
    );
  }

  return (
    <p className={`type-caption ${mutedClassName}`}>
      {item.reviewCount && item.reviewCount > 0
        ? `리뷰 ${item.reviewCount.toLocaleString("ko-KR")}건`
        : "아직 리뷰가 없어요"}
    </p>
  );
}

// 1st large, 2nd-3rd medium, then a short list: the order should be readable at a glance.
// The + sits on each card's bottom-right corner as a sibling of the link, since a button cannot nest in a link.
function RankingTiers({
  items,
  onProductClick,
}: {
  items: ProductListItem[];
  onProductClick: () => void;
}) {
  const onCoverLinkClick = useCoverLinkClick();
  const [first, ...rest] = items;
  const medium = rest.slice(0, MEDIUM_COUNT);
  const listed = rest.slice(MEDIUM_COUNT, HOME_RANKING_COUNT - 1);

  return (
    <ol aria-label="책 랭킹 목록" className="mt-3 px-4">
      <li className="relative">
        <Link
          aria-label={`1위, ${first.itemName} 상세 보기`}
          className="book-lift flex gap-4 rounded-panel bg-primary p-3 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={(event) => {
            onProductClick();
            onCoverLinkClick(event, `/products/${first.itemId}`, { thumbnailUrl: first.thumbnailUrl, title: first.itemName });
          }}
          to={`/products/${first.itemId}`}
        >
          <div className="book-lift-cover w-24 shrink-0 rounded-cover shadow-[0_10px_20px_-12px_rgba(0,0,0,0.8)]">
            <BookCover alt="" fallbackTitle={first.itemName} radius="cover" thumbnailUrl={first.thumbnailUrl} />
          </div>
          {/* Right padding keeps a long author line clear of the + circle. */}
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 pr-8">
            <span aria-hidden="true" className="type-numeral text-2xl text-[#f6c3c8]">01</span>
            <p className="line-clamp-2 break-keep type-title">{first.itemName}</p>
            <p className="truncate type-caption text-white/70">{first.author}</p>
            <ReviewLine item={first} tone="inverse" />
          </div>
        </Link>
        <QuickAddToCartButton
          className={CORNER_ADD_CLASS_NAME}
          productId={first.itemId}
          thumbnailUrl={first.thumbnailUrl}
          title={first.itemName}
          variant="icon"
        />
      </li>

      {medium.length > 0 ? (
        <li className="mt-3">
          <ol className="flex flex-col gap-3" start={2}>
            {medium.map((item, index) => (
              <li className="relative min-w-0" key={item.itemId}>
                <Link
                  aria-label={`${index + 2}위, ${item.itemName} 상세 보기`}
                  className="book-lift flex gap-3 rounded-panel bg-white/80 p-3 ring-1 ring-[#f3e7e1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  onClick={(event) => {
                    onProductClick();
                    onCoverLinkClick(event, `/products/${item.itemId}`, { thumbnailUrl: item.thumbnailUrl, title: item.itemName });
                  }}
                  to={`/products/${item.itemId}`}
                >
                  <div className="book-lift-cover w-16 shrink-0 self-start rounded-cover">
                    <BookCover alt="" fallbackTitle={item.itemName} radius="cover" thumbnailUrl={item.thumbnailUrl} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 pr-8">
                    <span aria-hidden="true" className="type-numeral text-lg text-[#d96f7a]">
                      {String(index + 2).padStart(2, "0")}
                    </span>
                    <p className="line-clamp-2 break-keep type-body-small font-semibold text-text-primary">
                      {item.itemName}
                    </p>
                    <p className="truncate type-caption text-text-tertiary">{item.author}</p>
                  </div>
                </Link>
                <QuickAddToCartButton
                  className={CORNER_ADD_CLASS_NAME}
                  productId={item.itemId}
                  thumbnailUrl={item.thumbnailUrl}
                  title={item.itemName}
                  variant="icon"
                />
              </li>
            ))}
          </ol>
        </li>
      ) : null}

      {listed.length > 0 ? (
        <li className="mt-3">
          <ol className="divide-y divide-[#f3e7e1] rounded-panel bg-white/60 px-3" start={MEDIUM_COUNT + 2}>
            {listed.map((item, index) => (
              <li className="flex items-center gap-1" key={item.itemId}>
                <Link
                  aria-label={`${index + MEDIUM_COUNT + 2}위, ${item.itemName} 상세 보기`}
                  className="flex min-h-11 min-w-0 flex-1 items-center gap-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  onClick={onProductClick}
                  to={`/products/${item.itemId}`}
                >
                  <span aria-hidden="true" className="w-5 shrink-0 type-caption font-semibold tabular-nums text-text-tertiary">
                    {String(index + MEDIUM_COUNT + 2).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1 truncate type-body-small text-text-primary">{item.itemName}</span>
                  <span className="max-w-[35%] shrink-0 truncate type-caption text-text-tertiary">{item.author}</span>
                </Link>
                {/* Pulled into the row padding so this circle shares the cards' vertical axis. */}
                <QuickAddToCartButton
                  className="-mr-2"
                  productId={item.itemId}
                  thumbnailUrl={item.thumbnailUrl}
                  title={item.itemName}
                  variant="icon"
                />
              </li>
            ))}
          </ol>
        </li>
      ) : null}
    </ol>
  );
}

function RankingIcon() {
  return (
    <span
      aria-hidden="true"
      className="flex h-7 w-5 shrink-0 items-end justify-center gap-0.5 pb-1.5"
    >
      <span className="h-2 w-1 rounded-full bg-[#eaa39d]" />
      <span className="h-3.5 w-1 rounded-full bg-[#dc7f86]" />
      <span className="h-2.5 w-1 rounded-full bg-[#edb18d]" />
    </span>
  );
}

export function BookRankingSection({
  onMoreClick,
  onProductClick,
  ranking,
  retry,
}: BookRankingSectionProps) {
  return (
    <section
      aria-labelledby="book-ranking-title"
      className="page-content min-w-0 py-8"
    >
      <div className="overflow-hidden rounded-[1.25rem] bg-[linear-gradient(145deg,#fffaf7_0%,#fff5f1_58%,#fffbf7_100%)] py-4 shadow-[0_12px_30px_-28px_rgba(114,69,59,0.35)] ring-1 ring-[#f3e7e1]/80">
        <div className="flex min-w-0 items-center justify-between gap-2 px-5">
          <div className="flex min-w-0 items-center gap-2">
            <RankingIcon />
            <h2
              className="shrink-0 type-title font-bold text-text-primary"
              id="book-ranking-title"
            >
              책 랭킹
            </h2>
            <p className="truncate text-[0.6875rem] leading-4 text-[#9d7d76]">
              많이 팔린 순서 · 1시간마다 갱신
            </p>
          </div>
          <button
            className="-mr-1 inline-flex min-h-9 shrink-0 items-center gap-0.5 rounded-full bg-white/75 px-3 type-caption font-semibold text-[#df777c] shadow-[0_5px_14px_-12px_rgba(114,69,59,0.7)] ring-1 ring-[#f5e8e3] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={onMoreClick}
            type="button"
          >
            더보기
            <span aria-hidden="true" className="text-base font-normal leading-none">›</span>
            <span className="sr-only"> 책 랭킹</span>
          </button>
        </div>

        {ranking.kind === "loading" ? (
          <div aria-busy="true" className="mt-3 px-4">
            <p className="sr-only" role="status">
              책 랭킹을 불러오는 중이에요
            </p>
            <div aria-hidden="true">
              <div className="flex gap-4 rounded-panel bg-white/70 p-3">
                <div className="aspect-[3/4] w-24 rounded-control bg-white" />
                <div className="flex flex-1 flex-col justify-center gap-2">
                  <div className="h-6 w-8 rounded bg-white" />
                  <div className="h-5 w-3/4 rounded bg-white" />
                  <div className="h-4 w-1/2 rounded bg-white" />
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-3">
                {Array.from({ length: MEDIUM_COUNT }, (_, index) => (
                  <div className="h-28 rounded-panel bg-white/70" key={index} />
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {ranking.kind === "error" ? (
          <div className="mt-4 px-4">
            <Toast action={<RetryButton onClick={retry} />} variant="error">
              책 랭킹을 불러오지 못했어요
            </Toast>
          </div>
        ) : null}

        {ranking.kind === "ready" && ranking.items.length === 0 ? (
          <p className="px-4 py-6 text-center type-body-small text-text-secondary">
            아직 집계된 책 랭킹이 없어요
          </p>
        ) : null}

        {ranking.kind === "ready" && ranking.items.length > 0 ? (
          <RankingTiers items={ranking.items} onProductClick={onProductClick} />
        ) : null}
      </div>
    </section>
  );
}
