import { BookCover } from "@/common/components/BookCover";
import { RetryButton } from "@/common/components/RetryButton";
import { Toast } from "@/common/components/Toast";
import { HomeSectionHeader } from "@/pages/home/components/HomeSectionHeader";
import { useHomeRecommendations } from "@/pages/home/hooks/useHomeRecommendations";

interface RecommendationSectionProps {
  onMoreClick: () => void;
}

const priceFormatter = new Intl.NumberFormat("ko-KR");
const SKELETON_COUNT = 3;
const RECOMMENDATION_CARD_CLASS_NAME = "flex w-[30%] shrink-0 flex-col gap-1.5";

// Feed items carry bookId only; product detail needs productId, so cards are not links yet.
export function RecommendationSection({ onMoreClick }: RecommendationSectionProps) {
  const { recommendations, retry } = useHomeRecommendations();

  return (
    <section
      aria-labelledby="book-recommendation-title"
      className="page-content flex flex-col gap-3"
    >
      <HomeSectionHeader
        id="book-recommendation-title"
        onMoreClick={onMoreClick}
        title="이런 책 어때요?"
      />

      {recommendations.kind === "loading" ? (
        <div aria-busy="true">
          <p className="sr-only" role="status">
            추천 도서를 불러오는 중이에요
          </p>
          <div aria-hidden="true" className="flex gap-3 overflow-hidden">
            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <div className={RECOMMENDATION_CARD_CLASS_NAME} key={index}>
                <div className="aspect-[3/4] rounded-control bg-muted" />
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
        <div
          aria-label="추천 도서 목록"
          className="-mx-5 overflow-x-auto px-5 pb-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          role="region"
          tabIndex={0}
        >
          <ul className="flex gap-3">
            {recommendations.items.map((book) => (
              <li className={RECOMMENDATION_CARD_CLASS_NAME} key={book.bookId}>
                <BookCover alt="" thumbnailUrl={book.coverUrl} />
                <p className="line-clamp-2 type-body-small font-semibold text-text-primary">
                  {book.title}
                </p>
                <p className="truncate type-caption text-text-tertiary">
                  {book.author ?? "저자 정보 없음"}
                </p>
                {book.price !== null ? (
                  <p className="type-body-small font-bold text-text-primary">
                    {priceFormatter.format(book.price)}원
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
