import type { BookSearchSort } from "@/features/search/types/bookSearch";
import type {
  SearchFilters,
  SearchRequestModel,
} from "@/pages/search/types/search";

const SORTS: BookSearchSort[] = ["popular", "newest", "price_asc"];

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

function readSort(value: string | null): BookSearchSort {
  return SORTS.includes(value as BookSearchSort)
    ? (value as BookSearchSort)
    : "popular";
}

export function readSearchRequest(searchParams: URLSearchParams): SearchRequestModel {
  return {
    priceMax: readNonNegativeInteger(searchParams.get("priceMax")),
    priceMin: readNonNegativeInteger(searchParams.get("priceMin")),
    pubYearFrom: readPositiveInteger(searchParams.get("pubYearFrom")),
    pubYearTo: readPositiveInteger(searchParams.get("pubYearTo")),
    query: searchParams.get("q")?.trim() ?? "",
    sort: readSort(searchParams.get("sort")),
  };
}

export function updateSearchParams(
  current: URLSearchParams,
  updates: Partial<SearchFilters> & {
    query?: string;
    sort?: BookSearchSort;
  },
) {
  const next = new URLSearchParams(current);
  const entries: [string, number | string | null | undefined][] = [
    ["q", updates.query],
    ["sort", updates.sort],
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
