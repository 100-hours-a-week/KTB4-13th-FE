import { RetryButton } from "@/common/components/RetryButton";
import type { CategoryState } from "@/pages/catalog/hooks/useCatalogCategories";
import type {
  CatalogFilterState,
  CatalogMode,
  RecommendationSort,
} from "@/pages/catalog/types/catalog";

const RECOMMENDATION_SORT_OPTIONS: {
  label: string;
  value: RecommendationSort;
}[] = [
  { label: "매칭점수순", value: "match" },
  { label: "신간순", value: "newest" },
  { label: "낮은가격순", value: "price_asc" },
];

const selectClassName =
  "min-h-11 rounded-full border border-border bg-surface px-3 type-caption text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:text-text-tertiary";

const pendingFilterClassName =
  "inline-flex min-h-11 items-center rounded-full border border-border bg-muted px-3 type-caption text-text-secondary";

interface CatalogFiltersProps {
  categoryState: CategoryState;
  filters: CatalogFilterState;
  mode: CatalogMode;
  onCategoryChange: (categoryId: number | null) => void;
  onRetryCategories: () => void;
  onSortChange: (sort: RecommendationSort) => void;
  sort: RecommendationSort;
}

export function CatalogFilters({
  categoryState,
  filters,
  mode,
  onCategoryChange,
  onRetryCategories,
  onSortChange,
  sort,
}: CatalogFiltersProps) {
  const categories =
    categoryState.kind === "ready" ? categoryState.categories : [];

  const handleCategoryChange = (value: string) => {
    onCategoryChange(value === "all" ? null : Number(value));
  };

  return (
    <section
      aria-label="도서 목록 필터와 정렬"
      className="border-b border-border bg-surface px-5 py-3"
    >
      <div className="flex gap-2 overflow-x-auto pb-1">
        <label className="shrink-0">
          <span className="sr-only">도서종류</span>
          <select
            className={selectClassName}
            disabled={categoryState.kind === "loading"}
            onChange={(event) => handleCategoryChange(event.target.value)}
            value={filters.categoryId ?? "all"}
          >
            <option value="all">
              {categoryState.kind === "loading"
                ? "도서종류 불러오는 중"
                : "도서종류 전체"}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <span
          aria-label="출간일 필터: 전체, 현재 전체 조건만 선택할 수 있습니다"
          className={`${pendingFilterClassName} shrink-0`}
        >
          출간일 전체
        </span>

        {mode === "recommendation" ? (
          <span
            aria-label="매칭도 필터: 전체, 현재 전체 조건만 선택할 수 있습니다"
            className={`${pendingFilterClassName} shrink-0`}
          >
            매칭도 전체
          </span>
        ) : null}
      </div>

      <div className="mt-2 flex min-h-11 items-center justify-between gap-3">
        <div className="min-w-0 type-caption text-text-secondary">
          {categoryState.kind === "error" ? (
            <p className="flex flex-wrap items-center gap-x-2" role="status">
              도서종류를 불러오지 못했어요
              <RetryButton onClick={onRetryCategories} />
            </p>
          ) : null}
          {categoryState.kind === "ready" && categories.length === 0 ? (
            <p role="status">선택할 수 있는 도서종류가 없어요</p>
          ) : null}
        </div>

        {mode === "ranking" ? (
          <p
            aria-label="정렬: 인기순 고정"
            className="shrink-0 type-caption font-semibold text-text-primary"
          >
            인기순
          </p>
        ) : (
          <label className="shrink-0">
            <span className="sr-only">추천 도서 정렬</span>
            <select
              className={selectClassName}
              onChange={(event) =>
                onSortChange(event.target.value as RecommendationSort)
              }
              value={sort}
            >
              {RECOMMENDATION_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </section>
  );
}
