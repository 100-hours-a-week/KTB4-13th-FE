import {
  INTEREST_CATEGORIES,
  toInterestCategory,
} from "@/features/onboarding/lib/interestCategories";
import { getPublicationYears } from "@/pages/catalog/lib/publicationYears";
import type {
  CatalogFilterState,
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

const MATCH_SCORE_OPTIONS: { label: string; value: number | null }[] = [
  { label: "매칭도 전체", value: null },
  { label: "60점 이상", value: 60 },
  { label: "70점 이상", value: 70 },
  { label: "80점 이상", value: 80 },
];

const selectClassName =
  "min-h-11 rounded-control border bg-surface px-3 type-caption focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:text-text-tertiary";

function getFilterSelectClassName(isActive: boolean) {
  return `${selectClassName} ${
    isActive
      ? "border-text-primary font-semibold text-text-primary"
      : "border-border text-text-secondary"
  }`;
}

interface CatalogFiltersProps {
  filters: CatalogFilterState;
  onFilterChange: (changes: Partial<CatalogFilterState>) => void;
  onSortChange: (sort: RecommendationSort) => void;
  sort: RecommendationSort;
}

// Recommendation list filters; the ranking list has its own field chips in RankingFilters.
export function CatalogFilters({
  filters,
  onFilterChange,
  onSortChange,
  sort,
}: CatalogFiltersProps) {
  const publicationYears = getPublicationYears();

  const handleInterestCategoryChange = (value: string) => {
    onFilterChange({ interestCategory: toInterestCategory(value) });
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
      className="border-b border-hairline bg-surface px-5 py-3"
    >
      <div className="flex gap-2 overflow-x-auto pb-1">
        {/* The recommendation feed filters by onboarding interest label, not /api/v1/categories id. */}
        <label className="shrink-0">
          <span className="sr-only">도서종류</span>
          <select
            className={getFilterSelectClassName(filters.interestCategory !== null)}
            onChange={(event) => handleInterestCategoryChange(event.target.value)}
            value={filters.interestCategory ?? "all"}
          >
            <option value="all">도서종류 전체</option>
            {INTEREST_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="flex shrink-0 items-center gap-1">
          <legend className="sr-only">출간연도 범위</legend>
          <label>
            <span className="sr-only">출간연도 시작</span>
            <select
              className={getFilterSelectClassName(
                filters.publicationYearFrom !== null,
              )}
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
              className={getFilterSelectClassName(
                filters.publicationYearTo !== null,
              )}
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

        <label className="shrink-0">
          <span className="sr-only">매칭도</span>
          <select
            className={getFilterSelectClassName(filters.matchScoreMin !== null)}
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
      </div>

      <div className="mt-2 flex min-h-11 items-center justify-end">
        <label className="shrink-0">
          <span className="sr-only">추천 도서 정렬</span>
          <select
            className={`${selectClassName} border-transparent font-semibold text-text-primary`}
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
      </div>
    </section>
  );
}
