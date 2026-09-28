import { RetryButton } from "@/common/components/RetryButton";
import { Toast } from "@/common/components/Toast";
import { BookCover } from "@/pages/home/components/BookCover";
import { HomeSectionHeader } from "@/pages/home/components/HomeSectionHeader";
import { useBookRanking } from "@/pages/home/hooks/useBookRanking";

const TOP_RANK = 3;
const SKELETON_COUNT = 3;
// One row ranked left to right; about 2.5 covers fit on a phone and the rest scroll sideways.
const RANK_CARD_CLASS_NAME = "relative w-[36%] shrink-0";

interface BookRankingSectionProps {
  onMoreClick: () => void;
}

function RankBadge({ rank }: { rank: number }) {
  const isTopRank = rank <= TOP_RANK;

  return (
    <span
      className={`absolute left-1.5 top-1.5 flex items-center justify-center rounded-control font-bold ${
        isTopRank
          ? "h-7 min-w-7 bg-accent px-1.5 text-sm text-white"
          : "h-6 min-w-6 border border-border bg-surface px-1 text-xs text-text-primary"
      }`}
    >
      {rank}
      <span className="sr-only">위</span>
    </span>
  );
}

export function BookRankingSection({ onMoreClick }: BookRankingSectionProps) {
  const { ranking, retry } = useBookRanking();

  return (
    <section aria-labelledby="book-ranking-title" className="page-content flex flex-col gap-3">
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
          <div aria-hidden="true" className="flex gap-3 overflow-hidden">
            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <div className={RANK_CARD_CLASS_NAME} key={index}>
                <div className="aspect-[3/4] rounded-control bg-muted" />
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
          className="-mx-5 overflow-x-auto px-5 pb-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          role="region"
          tabIndex={0}
        >
          <ol className="flex gap-3">
            {ranking.items.map((item, index) => (
              <li className={RANK_CARD_CLASS_NAME} key={item.itemId}>
                <BookCover alt={item.itemName} thumbnailUrl={item.thumbnailUrl} />
                <RankBadge rank={index + 1} />
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}
