import { useRecommendationPreview } from "@/dev/useRecommendationPreview";
import type { RecommendationFeedItem } from "@/features/recommendation/types/recommendationFeed";
import { HomeSectionHeader } from "@/pages/home/components/HomeSectionHeader";
import { CoverflowRecommendations } from "@/pages/home/components/RecommendationSection";
import type { BookRankingState } from "@/pages/home/hooks/useBookRanking";

const SHOW_DEV_CAROUSEL =
  import.meta.env.DEV && import.meta.env.VITE_DEV_HOME_RECOMMENDATION_PREVIEW === "true";

interface GuestRecommendationBannerProps {
  onLoginClick: () => void;
  ranking: BookRankingState;
}

export function GuestRecommendationBanner({
  onLoginClick,
  ranking,
}: GuestRecommendationBannerProps) {
  const previewBooks = useRecommendationPreview(SHOW_DEV_CAROUSEL);
  const publicPreviewBooks: RecommendationFeedItem[] =
    ranking.kind === "ready"
      ? ranking.items.slice(0, 15).map((item) => ({
          author: item.author,
          bookId: item.itemId,
          coverUrl: item.thumbnailUrl,
          inStock: true,
          matchScore: 0,
          price: item.discountedPrice ?? item.salePrice,
          productId: item.itemId,
          title: item.itemName,
        }))
      : [];
  const books = SHOW_DEV_CAROUSEL
    ? previewBooks
    : publicPreviewBooks;

  return (
    <section
      aria-labelledby="guest-recommendation-title"
      className="page-content flex min-w-0 flex-col gap-4 overflow-x-clip py-8 first:pt-5"
    >
      <HomeSectionHeader id="guest-recommendation-title" title="이런 책 어때요?" />
      <div className="relative min-w-0">
        <div
          aria-hidden="true"
          className="pointer-events-none min-h-[25rem] select-none opacity-70 blur-[2px]"
          inert
        >
          {books.length > 0 ? (
            <CoverflowRecommendations
              books={books}
              isPreview
              onProductClick={() => {}}
            />
          ) : (
            <div className="mx-auto mt-8 h-64 w-40 rounded-control bg-muted shadow-[0_16px_32px_-18px_rgba(36,33,31,0.7)]" />
          )}
        </div>
        <div className="pointer-events-none absolute inset-0 z-[300] flex items-center justify-center bg-background/20 px-6">
          <button
            className="pointer-events-auto min-h-11 rounded-control border border-border bg-surface/95 px-5 py-3 text-center type-body-small font-semibold text-text-primary shadow-[0_12px_30px_-18px_rgba(36,33,31,0.65)] backdrop-blur-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={onLoginClick}
            type="button"
          >
            로그인하면 취향에 맞는 책을 골라드려요
          </button>
        </div>
      </div>
    </section>
  );
}
