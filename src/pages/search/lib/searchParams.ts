import type {
  SearchFilters,
  SearchRequestModel,
  SearchResultSort,
} from "@/pages/search/types/search";

const SEARCH_RESULT_SIZE = 12;
const SORTS: SearchResultSort[] = ["popular", "newest", "price_asc"];

function readNonNegativeInteger(value: string | null) {
  if (value === null || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
}

function readPositiveInteger(value: string | null) {
  const parsed = readNonNegativeInteger(value);
  return parsed !== null && parsed > 0 ? parsed : null;
}

function readSort(value: string | null): SearchResultSort {
  return SORTS.includes(value as SearchResultSort)
    ? (value as SearchResultSort)
    : "popular";
}

export function readSearchRequest(searchParams: URLSearchParams): SearchRequestModel {
  return {
    categoryId: readPositiveInteger(searchParams.get("categoryId")),
    cursor: null,
    priceMax: readNonNegativeInteger(searchParams.get("priceMax")),
    priceMin: readNonNegativeInteger(searchParams.get("priceMin")),
    pubYearFrom: readNonNegativeInteger(searchParams.get("pubYearFrom")),
    pubYearTo: readNonNegativeInteger(searchParams.get("pubYearTo")),
    query: searchParams.get("q")?.trim() ?? "",
    size: SEARCH_RESULT_SIZE,
    sort: readSort(searchParams.get("sort")),
  };
}

export function updateSearchParams(
  current: URLSearchParams,
  updates: Partial<SearchFilters> & {
    query?: string;
    sort?: SearchResultSort;
  },
) {
  const next = new URLSearchParams(current);
  const entries: [string, number | string | null | undefined][] = [
    ["q", updates.query],
    ["sort", updates.sort],
    ["categoryId", updates.categoryId],
    ["priceMin", updates.priceMin],
    ["priceMax", updates.priceMax],
    ["pubYearFrom", updates.pubYearFrom],
    ["pubYearTo", updates.pubYearTo],
  ];

  entries.forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      if (value === null) {
        next.delete(key);
      }
      return;
    }

    next.set(key, String(value));
  });

  return next;
}
