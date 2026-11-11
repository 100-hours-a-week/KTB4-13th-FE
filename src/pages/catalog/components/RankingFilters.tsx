import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { ChevronDownIcon, InfoIcon } from "@/common/components/AppIcons";
import { RetryButton } from "@/common/components/RetryButton";
import type { CategoryState } from "@/pages/catalog/hooks/useCatalogCategories";
import { findCategoryGroup, groupCategories } from "@/pages/catalog/lib/categoryGroups";
import { getPublicationYears } from "@/pages/catalog/lib/publicationYears";
import type { CatalogFilterState } from "@/pages/catalog/types/catalog";

const SKELETON_CHIP_COUNT = 4;
const ROW_EDGE_PX = 20;

// Scrolls a chip row just enough to show its pressed chip, e.g. a sub-field picked near the end.
function revealPressedChip(row: HTMLElement | null) {
  const chip = row?.querySelector<HTMLElement>('[aria-pressed="true"]');
  if (!row || !chip) return;
  const left = chip.offsetLeft - ROW_EDGE_PX;
  const right = chip.offsetLeft + chip.offsetWidth + ROW_EDGE_PX;
  if (left < row.scrollLeft) {
    row.scrollLeft = left;
  } else if (right > row.scrollLeft + row.clientWidth) {
    row.scrollLeft = right - row.clientWidth;
  }
}

function FieldChip({
  children,
  onClick,
  pressed,
}: {
  children: ReactNode;
  onClick: () => void;
  pressed: boolean;
}) {
  return (
    <button
      aria-pressed={pressed}
      className="group flex min-h-11 shrink-0 items-center focus-visible:outline-none"
      onClick={onClick}
      type="button"
    >
      <span
        className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 type-caption transition-colors group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-primary ${
          pressed
            ? "border-primary bg-primary font-semibold text-white"
            : "border-border text-text-secondary group-hover:bg-muted"
        }`}
      >
        {children}
      </span>
    </button>
  );
}

function SubFieldTab({
  children,
  onClick,
  pressed,
}: {
  children: ReactNode;
  onClick: () => void;
  pressed: boolean;
}) {
  return (
    <button
      aria-pressed={pressed}
      className={`min-h-11 shrink-0 whitespace-nowrap border-b-2 type-caption focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${
        pressed
          ? "border-text-primary font-semibold text-text-primary"
          : "border-transparent text-text-tertiary hover:text-text-secondary"
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

// A native select that reads as plain text with a chevron, so the row stays light like a label.
function TextSelect({
  children,
  isActive,
  label,
  onChange,
  value,
}: {
  children: ReactNode;
  isActive: boolean;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="relative inline-flex min-h-11 items-center">
      <span className="sr-only">{label}</span>
      <select
        className={`min-h-11 cursor-pointer appearance-none rounded-control bg-transparent pr-5 pl-1 type-caption focus-visible:outline-2 focus-visible:outline-primary ${
          isActive ? "font-semibold text-text-primary" : "text-text-secondary"
        }`}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {children}
      </select>
      <ChevronDownIcon
        className="pointer-events-none absolute right-0 size-4 text-text-tertiary"
      />
    </label>
  );
}

interface RankingFiltersProps {
  categoryState: CategoryState;
  filters: CatalogFilterState;
  onFilterChange: (changes: Partial<CatalogFilterState>) => void;
  onRetryCategories: () => void;
}

// Fields as two chip rows (top-level, then the picked field's sub-fields), then publication years.
export function RankingFilters({
  categoryState,
  filters,
  onFilterChange,
  onRetryCategories,
}: RankingFiltersProps) {
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const topRowRef = useRef<HTMLDivElement>(null);
  const subRowRef = useRef<HTMLDivElement>(null);
  const groups = useMemo(
    () => (categoryState.kind === "ready" ? groupCategories(categoryState.categories) : []),
    [categoryState],
  );
  const selectedGroup = findCategoryGroup(groups, filters.categoryId);
  const publicationYears = getPublicationYears();

  useEffect(() => {
    revealPressedChip(topRowRef.current);
    revealPressedChip(subRowRef.current);
  }, [filters.categoryId, groups]);

  return (
    <section
      aria-label="책 랭킹 필터"
      className="border-b border-hairline bg-surface"
    >
      <div className="relative overflow-x-auto [scrollbar-width:none]" ref={topRowRef}>
        <div aria-label="분야" className="flex w-max items-center gap-1.5 px-5" role="group">
          <FieldChip onClick={() => onFilterChange({ categoryId: null })} pressed={selectedGroup === null}>
            전체
          </FieldChip>
          {groups.map((group) => (
            <FieldChip
              key={group.top.id}
              onClick={() => onFilterChange({ categoryId: group.top.id })}
              pressed={selectedGroup?.top.id === group.top.id}
            >
              {group.top.name}
            </FieldChip>
          ))}
          {categoryState.kind === "loading" ? (
            <>
              <span className="sr-only" role="status">분야를 불러오는 중이에요</span>
              {Array.from({ length: SKELETON_CHIP_COUNT }, (_, index) => (
                <span aria-hidden="true" className="h-8 w-16 shrink-0 rounded-full bg-muted" key={index} />
              ))}
            </>
          ) : null}
          {categoryState.kind === "error" ? (
            <p className="flex shrink-0 items-center gap-2 pl-1 type-caption text-text-secondary" role="status">
              분야를 불러오지 못했어요
              <RetryButton onClick={onRetryCategories} />
            </p>
          ) : null}
        </div>
      </div>

      {selectedGroup !== null && selectedGroup.children.length > 0 ? (
        <div
          className="relative overflow-x-auto border-b border-hairline [scrollbar-width:none]"
          ref={subRowRef}
        >
          <div
            aria-label={`${selectedGroup.top.name} 세부 분야`}
            className="flex w-max gap-4 px-5"
            role="group"
          >
            <SubFieldTab
              onClick={() => onFilterChange({ categoryId: selectedGroup.top.id })}
              pressed={filters.categoryId === selectedGroup.top.id}
            >
              {selectedGroup.top.name} 전체
            </SubFieldTab>
            {selectedGroup.children.map((child) => (
              <SubFieldTab
                key={child.id}
                onClick={() => onFilterChange({ categoryId: child.id })}
                pressed={filters.categoryId === child.id}
              >
                {child.name}
              </SubFieldTab>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-2 px-5">
        <fieldset className="flex min-w-0 items-center">
          <legend className="sr-only">출간연도 범위</legend>
          <span aria-hidden="true" className="pr-1 type-caption text-text-secondary">출간연도</span>
          <TextSelect
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
          <span aria-hidden="true" className="px-1 type-caption text-text-tertiary">~</span>
          <TextSelect
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

        <button
          aria-controls="ranking-update-note"
          aria-expanded={isNoteOpen}
          className="-mr-2 inline-flex min-h-11 shrink-0 items-center gap-1 rounded-control px-2 type-caption text-text-tertiary hover:text-text-secondary focus-visible:outline-2 focus-visible:outline-primary"
          onClick={() => setIsNoteOpen((current) => !current)}
          type="button"
        >
          1시간마다 갱신
          <InfoIcon className="size-4" />
        </button>
      </div>
      <p className="px-5 pb-3 type-caption text-text-secondary" hidden={!isNoteOpen} id="ranking-update-note">
        많이 팔린 순서로 보여 줘요. 순위는 1시간마다 갱신돼요.
      </p>
    </section>
  );
}
