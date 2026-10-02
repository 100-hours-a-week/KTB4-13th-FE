import { Link } from "react-router-dom";

import { ArrowLeftIcon } from "@/common/components/AppIcons";
import type {
  CatalogMode,
  RecommendationSort,
} from "@/pages/catalog/types/catalog";

const HEADER_COPY: Record<CatalogMode, { title: string }> = {
  ranking: { title: "책 랭킹 전체" },
  recommendation: { title: "추천 도서 전체" },
};

const SORT_LABEL: Record<RecommendationSort, string> = {
  match: "매칭점수순",
  newest: "신간순",
  price_asc: "낮은가격순",
};

interface CatalogHeaderProps {
  mode: CatalogMode;
  recommendationSort: RecommendationSort;
}

export function CatalogHeader({
  mode,
  recommendationSort,
}: CatalogHeaderProps) {
  const copy = HEADER_COPY[mode];
  const description =
    mode === "ranking"
      ? "책 랭킹 · 인기순"
      : `추천 도서 · ${SORT_LABEL[recommendationSort]}`;

  return (
    <header className="page-content shrink-0 bg-surface pb-2 pt-3">
      <div className="flex min-h-11 items-center gap-2">
        <Link
          aria-label="홈으로 돌아가기"
          className="-ml-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-text-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          to="/"
        >
          <ArrowLeftIcon className="size-6" />
        </Link>
        <h1 className="min-w-0 truncate type-section text-text-primary">
          {copy.title}
        </h1>
      </div>
      <p className="pl-11 type-caption text-text-tertiary">
        {description}
      </p>
    </header>
  );
}
