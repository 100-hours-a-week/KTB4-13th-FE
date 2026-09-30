import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { BottomNavigation } from "@/common/components/BottomNavigation";
import { Toast } from "@/common/components/Toast";
import { useTransientNotice } from "@/common/hooks/useTransientNotice";
import { SearchFilters } from "@/pages/search/components/SearchFilters";
import { SearchHeader } from "@/pages/search/components/SearchHeader";
import { SearchResultToolbar } from "@/pages/search/components/SearchResultToolbar";
import { SearchResultsContent } from "@/pages/search/components/SearchResultsContent";
import { useSearchResults } from "@/pages/search/hooks/useSearchResults";
import {
  readSearchRequest,
  updateSearchParams,
} from "@/pages/search/lib/searchParams";
import type { BookSearchSort } from "@/features/search/types/bookSearch";
import type { SearchFilters as SearchFilterValues } from "@/pages/search/types/search";

const UNAVAILABLE_NOTICE = "아직 준비 중인 기능이에요";

export function SearchResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { notice, showNotice } = useTransientNotice();
  const request = readSearchRequest(searchParams);
  const searchResults = useSearchResults(request);
  const filters: SearchFilterValues = {
    priceMax: request.priceMax,
    priceMin: request.priceMin,
    pubYearFrom: request.pubYearFrom,
    pubYearTo: request.pubYearTo,
  };

  const handleBack = () => {
    if (location.key === "default") {
      navigate("/", { replace: true });
      return;
    }

    navigate(-1);
  };

  const handleSubmit = (query: string) => {
    setSearchParams((current) => updateSearchParams(current, { query }));
  };

  const handleFiltersChange = (nextFilters: SearchFilterValues) => {
    setSearchParams((current) => updateSearchParams(current, nextFilters));
  };

  const handleSortChange = (sort: BookSearchSort) => {
    setSearchParams((current) => updateSearchParams(current, { sort }));
  };

  return (
    <div className="relative flex h-dvh min-w-0 flex-col overflow-x-hidden bg-surface">
      <SearchHeader
        key={request.query}
        onBack={handleBack}
        onSubmit={handleSubmit}
        submittedQuery={request.query}
      />
      <SearchFilters filters={filters} onChange={handleFiltersChange} />

      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        <SearchResultToolbar
          onSortChange={handleSortChange}
          sort={request.sort}
        />
        <SearchResultsContent
          onLoadMore={searchResults.loadMore}
          onRetry={searchResults.retry}
          state={searchResults.state}
        />
      </main>

      {notice ? (
        <div className="page-content pointer-events-none absolute inset-x-0 bottom-20 z-20">
          <Toast>{notice}</Toast>
        </div>
      ) : null}

      <BottomNavigation
        onUnavailableTabClick={() => showNotice(UNAVAILABLE_NOTICE)}
      />
    </div>
  );
}
