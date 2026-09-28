import { BookCover } from "@/pages/home/components/BookCover";
import { HomeSectionHeader } from "@/pages/home/components/HomeSectionHeader";
import { sampleRecommendedBooks } from "@/pages/home/mocks/sampleRecommendedBooks";

interface RecommendationSectionProps {
  onMoreClick: () => void;
}

const priceFormatter = new Intl.NumberFormat("ko-KR");

// TODO: Uses UI-only samples until the home recommendation API exists (see the mock module).
export function RecommendationSection({ onMoreClick }: RecommendationSectionProps) {
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
      <div
        aria-label="추천 도서 목록"
        className="-mx-5 overflow-x-auto px-5 pb-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        role="region"
        tabIndex={0}
      >
        <ul className="flex gap-3">
          {sampleRecommendedBooks.map((book) => (
            <li className="flex w-[30%] shrink-0 flex-col gap-1.5" key={book.id}>
              <BookCover alt="" thumbnailUrl={null} />
              <p className="line-clamp-2 type-body-small font-semibold text-text-primary">
                {book.title}
              </p>
              <p className="truncate type-caption text-text-tertiary">{book.author}</p>
              <p className="type-body-small font-bold text-text-primary">
                {priceFormatter.format(book.price)}원
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
