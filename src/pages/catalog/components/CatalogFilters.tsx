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

const OLDEST_PUBLICATION_YEAR = 2000;

const MATCH_SCORE_OPTIONS: { label: string; value: number | null }[] = [
  { label: "매칭도 전체", value: null },
  { label: "60점 이상", value: 60 },
  { label: "70점 이상", value: 70 },
  { label: "80점 이상", value: 80 },
];

const pendingFilterClassName =
  "inline-flex min-h-11 items-center rounded-full border border-border bg-muted px-3 type-caption text-text-secondary";

const selectClassName =
  "min-h-11 rounded-full border border-border bg-surface px-3 type-caption text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:text-text-tertiary";

interface CatalogFiltersProps {
  categoryState: CategoryState;
  filters: CatalogFilterState;
  mode: CatalogMode;
  onFilterChange: (changes: Partial<CatalogFilterState>) => void;
  onRetryCategories: () => void;
  onSortChange: (sort: RecommendationSort) => void;
  sort: RecommendationSort;
}

export function CatalogFilters({
  categoryState,
  filters,
  mode,
  onFilterChange,
  onRetryCategories,
  onSortChange,
  sort,
}: CatalogFiltersProps) {
  const categories =
    categoryState.kind === "ready" ? categoryState.categories : [];

  const currentYear = new Date().getFullYear();
  const publicationYears = Array.from(
    { length: currentYear - OLDEST_PUBLICATION_YEAR + 1 },
    (_, index) => currentYear - index,
  );

  const handleCategoryChange = (value: string) => {
    onFilterChange({ categoryId: value === "all" ? null : Number(value) });
  };

  const handlePublicationYearFromChange = (value: string) => {
    onFilterChange({ publicationYearFrom: value === "all" ? null : Number(value) });
  };

  const handlePublicationYearToChange = (value: string) => {
    onFilterChange({ publicationYearTo: value === "all" ? null : Number(value) });
  };

  const handleMatchScoreChange = (value: string) => {
    onFilterChange({ matchScoreMin: value === "all" ? null : Number(value) });
  };

  return (
    <section
      aria-label="도서 목록 필터와 정렬"
      className="border-b border-border bg-surface px-5 py-3"
    >
      <div className="flex gap-2 overflow-x-auto pb-1">
        {/* The recommendation feed accepts onboarding category labels, not /api/v1/categories ids. */}
        {mode === "recommendation" ? (
          <span
            aria-label="도서종류 필터: 전체, 현재 전체 조건만 선택할 수 있습니다"
            className={`${pendingFilterClassName} shrink-0`}
          >
            도서종류 전체
          </span>
        ) : (
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
        )}

        <fieldset className="flex shrink-0 items-center gap-1">
          <legend className="sr-only">출간연도 범위</legend>
          <label>
            <span className="sr-only">출간연도 시작</span>
            <select
              className={selectClassName}
              onChange={(event) =>
                handlePublicationYearFromChange(event.target.value)
              }
              value={filters.publicationYearFrom ?? "all"}
            >
              <option value="all">출간연도 전체</option>
              {publicationYears.map((year) => (
                <option
                  disabled={
                    filters.publicationYearTo !== null &&
                    year > filters.publicationYearTo
                  }
                  key={year}
                  value={year}
                >
                  {year}년
                </option>
              ))}
            </select>
          </label>
          <span aria-hidden="true" className="type-caption text-text-tertiary">
            ~
          </span>
          <label>
            <span className="sr-only">출간연도 끝</span>
            <select
              className={selectClassName}
              onChange={(event) =>
                handlePublicationYearToChange(event.target.value)
              }
              value={filters.publicationYearTo ?? "all"}
            >
              <option value="all">전체</option>
              {publicationYears.map((year) => (
                <option
                  disabled={
                    filters.publicationYearFrom !== null &&
                    year < filters.publicationYearFrom
                  }
                  key={year}
                  value={year}
                >
                  {year}년
                </option>
              ))}
            </select>
          </label>
        </fieldset>

        {mode === "recommendation" ? (
          <label className="shrink-0">
            <span className="sr-only">매칭도</span>
            <select
              className={selectClassName}
              onChange={(event) => handleMatchScoreChange(event.target.value)}
              value={filters.matchScoreMin ?? "all"}
            >
              {MATCH_SCORE_OPTIONS.map((option) => (
                <option key={option.label} value={option.value ?? "all"}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <div className="mt-2 flex min-h-11 items-center justify-between gap-3">
        <div className="min-w-0 type-caption text-text-secondary">
          {mode === "ranking" && categoryState.kind === "error" ? (
            <p className="flex flex-wrap items-center gap-x-2" role="status">
              도서종류를 불러오지 못했어요
              <RetryButton onClick={onRetryCategories} />
            </p>
          ) : null}
          {mode === "ranking" &&
          categoryState.kind === "ready" &&
          categories.length === 0 ? (
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
