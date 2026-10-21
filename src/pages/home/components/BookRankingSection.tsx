import { Link } from "react-router-dom";

import { BookCover } from "@/common/components/BookCover";
import { RetryButton } from "@/common/components/RetryButton";
import { Toast } from "@/common/components/Toast";
import { HomeSectionHeader } from "@/pages/home/components/HomeSectionHeader";
import type { BookRankingState } from "@/pages/home/hooks/useBookRanking";

const TOP_RANK = 3;
const SKELETON_COUNT = 3;
// One row ranked left to right; about two products fit on a phone.
const RANK_CARD_CLASS_NAME = "w-[48%] shrink-0";

interface BookRankingSectionProps {
  onMoreClick: () => void;
  onProductClick: () => void;
  ranking: BookRankingState;
  retry: () => void;
}

function RankNumeral({ rank }: { rank: number }) {
  const isTopRank = rank <= TOP_RANK;

  return (
    <span
      aria-hidden="true"
      className={`rank-number absolute bottom-0 left-0 z-0 select-none tabular-nums ${
        isTopRank ? "rank-number-top" : ""
      }`}
    >
      {rank}
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
      className="page-content flex min-w-0 flex-col gap-5 py-8"
    >
      <HomeSectionHeader
        id="book-ranking-title"
        onMoreClick={onMoreClick}
        title="책 랭킹"
      />

      {ranking.kind === "loading" ? (
        <div aria-busy="true">
          <p className="sr-only" role="status">
            책 랭킹을 불러오는 중이에요
          </p>
          <div aria-hidden="true" className="flex gap-4 overflow-hidden">
            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <div className={RANK_CARD_CLASS_NAME} key={index}>
                <div className="aspect-[3/4] rounded-cover bg-muted" />
                <div className="mt-2.5 h-7 w-9 rounded-cover bg-muted" />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {ranking.kind === "error" ? (
        <Toast action={<RetryButton onClick={retry} />} variant="error">
          책 랭킹을 불러오지 못했어요
        </Toast>
      ) : null}

      {ranking.kind === "ready" && ranking.items.length === 0 ? (
        <p className="py-6 text-center type-body-small text-text-secondary">
          아직 집계된 책 랭킹이 없어요
        </p>
      ) : null}

      {ranking.kind === "ready" && ranking.items.length > 0 ? (
        // Focusable so keyboard users can scroll the sideways list.
        <div
          aria-label="책 랭킹 목록"
          className="-mx-5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          role="region"
          tabIndex={0}
        >
          <ol className="flex gap-3 py-2">
            {ranking.items.map((item, index) => (
              <li className={RANK_CARD_CLASS_NAME} key={item.itemId}>
                <Link
                  aria-label={`${index + 1}위, ${item.itemName} 상세 보기`}
                  className="group block rounded-panel focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  onClick={onProductClick}
                  to={`/products/${item.itemId}`}
                >
                  <div className="relative pt-2">
                    <RankNumeral rank={index + 1} />
                    <div className="relative z-10 ml-8 rounded-control bg-muted shadow-[0_16px_32px_-18px_rgba(36,33,31,0.7)] transition-transform duration-300 group-hover:-translate-y-1 group-focus-visible:-translate-y-1 [&>div]:!rounded-control [&>div]:!border-transparent">
                      <BookCover
                        alt=""
                        fallbackTitle={item.itemName}
                        radius="control"
                        thumbnailUrl={item.thumbnailUrl}
                      />
                    </div>
                  </div>
                  <p className="ml-8 mt-3 line-clamp-2 min-h-10 break-keep type-body-small font-semibold text-text-primary">
                    {item.itemName}
                  </p>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}
