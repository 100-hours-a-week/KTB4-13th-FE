import { useState, type FormEvent } from "react";

import type { SearchFilters as SearchFilterValues } from "@/pages/search/types/search";

type RangeKind = "price" | "year";

const controlClassName =
  "min-h-11 shrink-0 rounded-control border bg-surface px-3 type-caption aria-expanded:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:text-text-tertiary";
const pendingFilterClassName =
  "inline-flex min-h-11 shrink-0 items-center rounded-control bg-muted px-3 type-caption text-text-tertiary";
const priceFormatter = new Intl.NumberFormat("ko-KR");

function parseOptionalInteger(value: string) {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

interface RangeFilterPanelProps {
  from: number | null;
  kind: RangeKind;
  onApply: (from: number | null, to: number | null) => void;
  onClose: () => void;
  to: number | null;
}

function RangeFilterPanel({
  from,
  kind,
  onApply,
  onClose,
  to,
}: RangeFilterPanelProps) {
  const [fromValue, setFromValue] = useState(from?.toString() ?? "");
  const [toValue, setToValue] = useState(to?.toString() ?? "");
  const [error, setError] = useState<string | null>(null);
  const isPrice = kind === "price";
  const noun = isPrice ? "가격" : "출간연도";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextFrom = parseOptionalInteger(fromValue);
    const nextTo = parseOptionalInteger(toValue);

    if (nextFrom === undefined || nextTo === undefined) {
      setError("숫자를 입력해 주세요");
      return;
    }

    if (
      (nextFrom !== null && nextFrom < 0) ||
      (nextTo !== null && nextTo < 0)
    ) {
      setError(`${noun}는 0 이상으로 입력해 주세요`);
      return;
    }

    if (nextFrom !== null && nextTo !== null && nextFrom > nextTo) {
      setError(`최소 ${noun}는 최대 ${noun}보다 클 수 없어요`);
      return;
    }

    onApply(nextFrom, nextTo);
  };

  return (
    <form
      className="mt-3 border-t border-hairline pt-4"
      id={`search-${kind}-filter`}
      onSubmit={handleSubmit}
    >
      <fieldset>
        <legend className="type-body-small font-semibold text-text-primary">
          {noun} 범위
        </legend>
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
          <label>
            <span className="sr-only">최소 {noun}</span>
            <input
              className="min-h-11 w-full rounded-control border border-border bg-surface px-3 type-body-small outline-none focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
              inputMode="numeric"
              min={0}
              onChange={(event) => setFromValue(event.target.value)}
              placeholder={isPrice ? "최소 가격" : "시작 연도"}
              step="1"
              type="number"
              value={fromValue}
            />
          </label>
          <span aria-hidden="true" className="text-text-tertiary">
            –
          </span>
          <label>
            <span className="sr-only">최대 {noun}</span>
            <input
              className="min-h-11 w-full rounded-control border border-border bg-surface px-3 type-body-small outline-none focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
              inputMode="numeric"
              min={0}
              onChange={(event) => setToValue(event.target.value)}
              placeholder={isPrice ? "최대 가격" : "종료 연도"}
              step="1"
              type="number"
              value={toValue}
            />
          </label>
        </div>
      </fieldset>
      {error ? (
        <p className="mt-2 type-caption text-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-3 flex justify-end gap-2">
        <button
          className="min-h-11 rounded-control px-3 type-body-small font-semibold text-text-secondary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={() => onApply(null, null)}
          type="button"
        >
          조건 지우기
        </button>
        <button
          className="min-h-11 rounded-control px-3 type-body-small font-semibold text-text-secondary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={onClose}
          type="button"
        >
          닫기
        </button>
        <button
          className="min-h-11 rounded-control bg-primary px-4 type-body-small font-semibold text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          type="submit"
        >
          적용
        </button>
      </div>
    </form>
  );
}

function formatPriceRange(min: number | null, max: number | null) {
  if (min === null && max === null) {
    return "가격대";
  }
  if (min === null) {
    return `${priceFormatter.format(max ?? 0)}원 이하`;
  }
  if (max === null) {
    return `${priceFormatter.format(min)}원 이상`;
  }
  return `${priceFormatter.format(min)}–${priceFormatter.format(max)}원`;
}

function formatYearRange(from: number | null, to: number | null) {
  if (from === null && to === null) {
    return "출간연도";
  }
  if (from === null) {
    return `${to}년 이전`;
  }
  if (to === null) {
    return `${from}년 이후`;
  }
  return `${from}–${to}년`;
}

interface SearchFiltersProps {
  filters: SearchFilterValues;
  onChange: (filters: SearchFilterValues) => void;
}

export function SearchFilters({ filters, onChange }: SearchFiltersProps) {
  const [openRange, setOpenRange] = useState<RangeKind | null>(null);

  return (
    <section
      aria-label="검색 결과 필터"
      className="shrink-0 border-b border-hairline bg-surface px-5 pb-3"
    >
      <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
        {/* Search accepts onboarding category labels, not /api/v1/categories values, so it stays unfiltered. */}
        <span
          aria-label="카테고리 필터: 전체, 현재 전체 조건만 선택할 수 있습니다"
          className={pendingFilterClassName}
        >
          카테고리 전체
        </span>

        <button
          aria-controls="search-price-filter"
          aria-expanded={openRange === "price"}
          className={`${controlClassName} ${
            filters.priceMin !== null || filters.priceMax !== null
              ? "border-text-primary font-semibold text-text-primary"
              : "border-border text-text-secondary"
          }`}
          onClick={() =>
            setOpenRange((current) => (current === "price" ? null : "price"))
          }
          type="button"
        >
          {formatPriceRange(filters.priceMin, filters.priceMax)}
        </button>

        <button
          aria-controls="search-year-filter"
          aria-expanded={openRange === "year"}
          className={`${controlClassName} ${
            filters.pubYearFrom !== null || filters.pubYearTo !== null
              ? "border-text-primary font-semibold text-text-primary"
              : "border-border text-text-secondary"
          }`}
          onClick={() =>
            setOpenRange((current) => (current === "year" ? null : "year"))
          }
          type="button"
        >
          {formatYearRange(filters.pubYearFrom, filters.pubYearTo)}
        </button>
      </div>

      {openRange === "price" ? (
        <RangeFilterPanel
          from={filters.priceMin}
          key={`price-${filters.priceMin}-${filters.priceMax}`}
          kind="price"
          onApply={(priceMin, priceMax) => {
            onChange({ ...filters, priceMax, priceMin });
            setOpenRange(null);
          }}
          onClose={() => setOpenRange(null)}
          to={filters.priceMax}
        />
      ) : null}
      {openRange === "year" ? (
        <RangeFilterPanel
          from={filters.pubYearFrom}
          key={`year-${filters.pubYearFrom}-${filters.pubYearTo}`}
          kind="year"
          onApply={(pubYearFrom, pubYearTo) => {
            onChange({ ...filters, pubYearFrom, pubYearTo });
            setOpenRange(null);
          }}
          onClose={() => setOpenRange(null)}
          to={filters.pubYearTo}
        />
      ) : null}
    </section>
  );
}
