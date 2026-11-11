import { useMemo, type ReactNode } from "react";

import { ChevronDownIcon } from "@/common/components/AppIcons";
import { RetryButton } from "@/common/components/RetryButton";
import type { CategoryState } from "@/pages/catalog/hooks/useCatalogCategories";
import { groupCategories } from "@/pages/catalog/lib/categoryGroups";
import { getPublicationYears } from "@/pages/catalog/lib/publicationYears";
import type { CatalogFilterState } from "@/pages/catalog/types/catalog";

// The product list matches a category id exactly, so a top-level field's own option only covers
// books filed directly under it, not its sub-fields.
const TOP_LEVEL_SUFFIX = " 일반";

// Reads as plain text with a chevron. The native select lies invisibly on top, so the control is
// only as wide as the chosen label (a bare select is as wide as its longest option).
function TextSelect({
  children,
  disabled = false,
  displayLabel,
  isActive,
  label,
  onChange,
  value,
}: {
  children: ReactNode;
  disabled?: boolean;
  displayLabel: string;
  isActive: boolean;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="relative inline-flex min-h-11 min-w-0 items-center gap-0.5 rounded-control px-1 has-[select:focus-visible]:outline-2 has-[select:focus-visible]:outline-primary">
      <span className="sr-only">{label}</span>
      <span
        aria-hidden="true"
        className={`truncate type-caption ${isActive ? "font-semibold text-text-primary" : "text-text-secondary"}`}
      >
        {displayLabel}
      </span>
      <ChevronDownIcon className="size-4 shrink-0 text-text-tertiary" />
      <select
        className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-wait"
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {children}
      </select>
    </label>
  );
}

interface RankingFiltersProps {
  categoryState: CategoryState;
  filters: CatalogFilterState;
  onFilterChange: (changes: Partial<CatalogFilterState>) => void;
  onRetryCategories: () => void;
}

// One text-style field dropdown, grouped by top-level field, beside the publication years.
export function RankingFilters({
  categoryState,
  filters,
  onFilterChange,
  onRetryCategories,
}: RankingFiltersProps) {
  const groups = useMemo(
    () => (categoryState.kind === "ready" ? groupCategories(categoryState.categories) : []),
    [categoryState],
  );
  const publicationYears = getPublicationYears();

  const selectedCategoryLabel = useMemo(() => {
    for (const group of groups) {
      if (group.top.id === filters.categoryId) return `${group.top.name}${TOP_LEVEL_SUFFIX}`;
      const child = group.children.find((category) => category.id === filters.categoryId);
      if (child) return child.name;
    }
    return "분야 전체";
  }, [filters.categoryId, groups]);

  return (
    <section
      aria-label="책 랭킹 필터"
      className="border-b border-hairline bg-surface px-4"
    >
      <div className="flex flex-wrap items-center gap-x-3">
        <TextSelect
          disabled={categoryState.kind === "loading"}
          displayLabel={categoryState.kind === "loading" ? "분야 불러오는 중" : selectedCategoryLabel}
          isActive={filters.categoryId !== null}
          label="분야"
          onChange={(value) => onFilterChange({ categoryId: value === "all" ? null : Number(value) })}
          value={String(filters.categoryId ?? "all")}
        >
          <option value="all">분야 전체</option>
          {groups.map((group) => (
            <optgroup key={group.top.id} label={group.top.name}>
              <option value={group.top.id}>
                {group.top.name}
                {TOP_LEVEL_SUFFIX}
              </option>
              {group.children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </optgroup>
          ))}
        </TextSelect>

        <fieldset className="flex min-w-0 items-center">
          <legend className="sr-only">출간연도 범위</legend>
          <span aria-hidden="true" className="pl-1 type-caption text-text-secondary">출간연도</span>
          <TextSelect
            displayLabel={filters.publicationYearFrom === null ? "전체" : `${filters.publicationYearFrom}년`}
            isActive={filters.publicationYearFrom !== null}
            label="출간연도 시작"
            onChange={(value) => onFilterChange({ publicationYearFrom: value === "all" ? null : Number(value) })}
            value={String(filters.publicationYearFrom ?? "all")}
          >
            <option value="all">전체</option>
            {publicationYears.map((year) => (
              <option
                disabled={filters.publicationYearTo !== null && year > filters.publicationYearTo}
                key={year}
                value={year}
              >
                {year}년
              </option>
            ))}
          </TextSelect>
          <span aria-hidden="true" className="type-caption text-text-tertiary">~</span>
          <TextSelect
            displayLabel={filters.publicationYearTo === null ? "전체" : `${filters.publicationYearTo}년`}
            isActive={filters.publicationYearTo !== null}
            label="출간연도 끝"
            onChange={(value) => onFilterChange({ publicationYearTo: value === "all" ? null : Number(value) })}
            value={String(filters.publicationYearTo ?? "all")}
          >
            <option value="all">전체</option>
            {publicationYears.map((year) => (
              <option
                disabled={filters.publicationYearFrom !== null && year < filters.publicationYearFrom}
                key={year}
                value={year}
              >
                {year}년
              </option>
            ))}
          </TextSelect>
        </fieldset>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 pl-1 type-caption text-text-secondary">
          {categoryState.kind === "error" ? (
            <p className="flex flex-wrap items-center gap-x-2" role="status">
              분야를 불러오지 못했어요
              <RetryButton onClick={onRetryCategories} />
            </p>
          ) : null}
        </div>
        <p className="shrink-0 px-1 pb-2 type-caption text-text-tertiary">
          1시간마다 갱신
        </p>
      </div>
    </section>
  );
}
