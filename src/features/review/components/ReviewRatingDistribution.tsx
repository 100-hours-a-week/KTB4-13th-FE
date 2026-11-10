import type { ProductReview } from "@/features/review/types/review";

const RATINGS = [5, 4, 3, 2, 1];

export function ReviewRatingDistribution({ reviews }: { reviews: ProductReview[] }) {
  const counts = new Map<number, number>();
  for (const { rate } of reviews) {
    const rating = Math.round(rate);
    counts.set(rating, (counts.get(rating) ?? 0) + 1);
  }

  return (
    <ul aria-label="별점별 리뷰 수" className="flex-1 space-y-1.5">
      {RATINGS.map((rating) => {
        const count = counts.get(rating) ?? 0;
        return (
          <li className="flex items-center gap-2 type-caption text-text-secondary" key={rating}>
            <span className="shrink-0">{rating}점</span>
            <span aria-hidden="true" className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <span className="block h-full rounded-full bg-accent" style={{ width: `${count / reviews.length * 100}%` }} />
            </span>
            <span className="min-w-6 text-right tabular-nums">{count.toLocaleString("ko-KR")}개</span>
          </li>
        );
      })}
    </ul>
  );
}
