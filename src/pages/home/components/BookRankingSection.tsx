import { Link } from "react-router-dom";

import { BookCover } from "@/common/components/BookCover";
import { RetryButton } from "@/common/components/RetryButton";
import { Toast } from "@/common/components/Toast";
import type { BookRankingState } from "@/pages/home/hooks/useBookRanking";

const SKELETON_COUNT = 3;
const RANK_CARD_CLASS_NAME = "w-[10.25rem] shrink-0";
const RANK_COLORS = ["text-[#e7828d]", "text-[#c8aa87]", "text-[#eea078]", "text-[#b9a7a0]"];

interface BookRankingSectionProps {
  onMoreClick: () => void;
  onProductClick: () => void;
  ranking: BookRankingState;
  retry: () => void;
}

function RankNumeral({ rank }: { rank: number }) {
  return (
    <span
      aria-hidden="true"
      className={`rank-number mt-3 block w-10 shrink-0 select-none whitespace-nowrap text-center tabular-nums ${rank >= 10 ? "rank-number-double" : ""} ${RANK_COLORS[(rank - 1) % RANK_COLORS.length]}`}
    >
      {rank}
    </span>
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
              지금, 가장 사랑받는 책이에요
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
          <div aria-busy="true" className="mt-3">
            <p className="sr-only" role="status">
              책 랭킹을 불러오는 중이에요
            </p>
            <div aria-hidden="true" className="flex overflow-hidden px-4">
              {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                <div className={RANK_CARD_CLASS_NAME} key={index}>
                  <div className="flex items-start gap-2">
                    <div className="mt-3 h-14 w-10 rounded-control bg-white/70" />
                    <div className="aspect-[3/4] w-24 rounded-control bg-white/70" />
                  </div>
                  <div className="ml-12 mt-2.5 h-[4.75rem] w-24 rounded-control bg-white/70" />
                </div>
              ))}
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
          <div
            aria-label="책 랭킹 목록"
            className="mt-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
            role="region"
            tabIndex={0}
          >
            <ol className="flex">
              {ranking.items.map((item, index) => {
                const hasReviewSummary =
                  typeof item.reviewCount === "number" &&
                  item.reviewCount > 0 &&
                  typeof item.reviewRate === "number" &&
                  item.reviewRate > 0;

                return (
                  <li className={RANK_CARD_CLASS_NAME} key={item.itemId}>
                    <Link
                      aria-label={`${index + 1}위, ${item.itemName} 상세 보기`}
                      className="group block rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      onClick={onProductClick}
                      to={`/products/${item.itemId}`}
                    >
                      <div className="flex items-start gap-2 overflow-visible">
                        <RankNumeral rank={index + 1} />
                        <div className="w-24 shrink-0 rounded-control bg-muted shadow-[0_13px_22px_-14px_rgba(86,58,50,0.42)] transition-transform duration-300 group-hover:-translate-y-1 group-focus-visible:-translate-y-1 [&>div]:!rounded-control [&>div]:!border-transparent">
                          <BookCover
                            alt=""
                            fallbackTitle={item.itemName}
                            radius="control"
                            thumbnailUrl={item.thumbnailUrl}
                          />
                        </div>
                      </div>
                      <div className="ml-12 mt-2.5 flex h-[4.75rem] w-24 flex-col">
                        <p className="line-clamp-2 shrink-0 break-keep type-body-small font-bold leading-5 text-text-primary">
                          {item.itemName}
                        </p>
                        <p className="mt-0.5 shrink-0 truncate type-caption text-text-tertiary">
                          {item.author}
                        </p>
                        {hasReviewSummary ? (
                          <p className="mt-auto flex h-4 shrink-0 items-center gap-1 type-caption font-semibold text-[#d96f7a]">
                            <span aria-hidden="true">★</span>
                            <span className="tabular-nums">
                              {item.reviewRate?.toFixed(1)} ({item.reviewCount?.toLocaleString("ko-KR")})
                            </span>
                          </p>
                        ) : item.reviewCount && item.reviewCount > 0 ? (
                          <p className="mt-auto flex h-4 shrink-0 items-center gap-1 type-caption text-text-tertiary">
                            리뷰 {item.reviewCount.toLocaleString("ko-KR")}건
                          </p>
                        ) : (
                          <p className="mt-auto flex h-4 shrink-0 items-center gap-1 type-caption text-text-tertiary">
                            <span aria-hidden="true" className="text-[#d9a0a0]">☆</span>
                            리뷰 없음
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        ) : null}
      </div>
    </section>
  );
}
