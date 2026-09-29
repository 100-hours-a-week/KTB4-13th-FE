import { useMemo, useState } from "react";

import { BottomNavigation } from "@/common/components/BottomNavigation";
import { Toast } from "@/common/components/Toast";
import { useTransientNotice } from "@/common/hooks/useTransientNotice";
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

const UNAVAILABLE_NOTICE = "아직 준비 중인 기능이에요";

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
  const { notice, showNotice } = useTransientNotice();

  const requestModel = useMemo(
    () =>
      mode === "ranking"
        ? toRankingRequestModel(filters)
        : toRecommendationRequestModel(filters, sort),
    [filters, mode, sort],
  );
  const catalogBooks = useCatalogBooks(requestModel);

  const handleCategoryChange = (categoryId: number | null) => {
    setFilters((current) => ({ ...current, categoryId }));
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
            onCategoryChange={handleCategoryChange}
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
