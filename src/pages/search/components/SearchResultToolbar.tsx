import type {
  SearchResultSort,
  SearchResultState,
} from "@/pages/search/types/search";

const SORT_OPTIONS: { label: string; value: SearchResultSort }[] = [
  { label: "인기순", value: "popular" },
  { label: "신간순", value: "newest" },
  { label: "낮은가격순", value: "price_asc" },
];

interface SearchResultToolbarProps {
  onSortChange: (sort: SearchResultSort) => void;
  sort: SearchResultSort;
  state: SearchResultState;
}

export function SearchResultToolbar({
  onSortChange,
  sort,
  state,
}: SearchResultToolbarProps) {
  const loadedCount = state.kind === "ready" ? state.items.length : null;

  return (
    <div className="page-content flex min-h-14 items-center justify-between gap-3 border-b border-border bg-surface">
      <p
        aria-live="polite"
        className="type-body-small font-semibold text-text-primary"
      >
        {loadedCount === null ? "검색 결과" : `불러온 결과 ${loadedCount}권`}
      </p>
      <label className="shrink-0">
        <span className="sr-only">검색 결과 정렬</span>
        <select
          className="min-h-11 rounded-control border border-transparent bg-surface px-2 type-body-small text-text-primary focus-visible:border-border focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
          onChange={(event) =>
            onSortChange(event.target.value as SearchResultSort)
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
