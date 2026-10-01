import { useMemo, useState } from "react";

import { BottomNavigation } from "@/common/components/BottomNavigation";
import { CatalogBookList } from "@/pages/catalog/components/CatalogBookList";
import { CatalogFilters } from "@/pages/catalog/components/CatalogFilters";
import { CatalogHeader } from "@/pages/catalog/components/CatalogHeader";
import { useCatalogBooks } from "@/pages/catalog/hooks/useCatalogBooks";
import { useCatalogCategories } from "@/pages/catalog/hooks/useCatalogCategories";
import {
  toRankingRequestModel,
  toRecommendationRequestModel,
} from "@/pages/catalog/lib/catalogRequest";
import type {
  CatalogFilterState,
  CatalogMode,
  RecommendationSort,
} from "@/pages/catalog/types/catalog";

const INITIAL_FILTERS: CatalogFilterState = {
  categoryId: null,
  matchScoreMin: null,
  publicationYearFrom: null,
  publicationYearTo: null,
};

export function CatalogPage({ mode }: { mode: CatalogMode }) {
  const [filters, setFilters] = useState<CatalogFilterState>(INITIAL_FILTERS);
  const [sort, setSort] = useState<RecommendationSort>("match");
  const { categoryState, retryCategories } = useCatalogCategories();

  const requestModel = useMemo(
    () =>
      mode === "ranking"
        ? toRankingRequestModel(filters)
        : toRecommendationRequestModel(filters, sort),
    [filters, mode, sort],
  );
  const catalogBooks = useCatalogBooks(requestModel);

  const handleFilterChange = (changes: Partial<CatalogFilterState>) => {
    setFilters((current) => ({ ...current, ...changes }));
  };

  return (
    <div className="relative flex h-dvh flex-col bg-surface">
      <CatalogHeader mode={mode} recommendationSort={sort} />

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10">
          <CatalogFilters
            categoryState={categoryState}
            filters={filters}
            mode={mode}
            onFilterChange={handleFilterChange}
            onRetryCategories={retryCategories}
            onSortChange={setSort}
            sort={sort}
          />
        </div>
        <CatalogBookList
          hasLoadMoreError={catalogBooks.hasLoadMoreError}
          items={catalogBooks.items}
          mode={mode}
          nextCursor={catalogBooks.nextCursor}
          onLoadMore={catalogBooks.loadMore}
          onRetry={catalogBooks.retry}
          status={catalogBooks.status}
        />
      </main>

      <BottomNavigation />
    </div>
  );
}
