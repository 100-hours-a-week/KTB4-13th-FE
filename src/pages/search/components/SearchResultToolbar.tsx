import type { BookSearchSort } from "@/features/search/types/bookSearch";

const SORT_OPTIONS: { label: string; value: BookSearchSort }[] = [
  { label: "인기순", value: "popular" },
  { label: "신간순", value: "newest" },
  { label: "낮은가격순", value: "price_asc" },
];

interface SearchResultToolbarProps {
  onSortChange: (sort: BookSearchSort) => void;
  sort: BookSearchSort;
}

export function SearchResultToolbar({
  onSortChange,
  sort,
}: SearchResultToolbarProps) {
  return (
    <div className="page-content flex min-h-14 items-center justify-between gap-3 bg-surface">
      {/* The search contract has no total count, so no result count is shown. */}
      <p className="type-body-small font-semibold text-text-primary">
        검색 결과
      </p>
      <label className="shrink-0">
        <span className="sr-only">검색 결과 정렬</span>
        <select
          className="min-h-11 rounded-control border border-transparent bg-surface px-2 type-body-small font-semibold text-text-primary focus-visible:border-border focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
          onChange={(event) =>
            onSortChange(event.target.value as BookSearchSort)
          }
          value={sort}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
