import { useLayoutEffect, useRef } from "react";
import {
  createSearchParams,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { BottomNavigation } from "@/common/components/BottomNavigation";
import { Toast } from "@/common/components/Toast";
import { useTransientNotice } from "@/common/hooks/useTransientNotice";
import { LoginRequired } from "@/features/auth/components/LoginRequired";
import { useAuth } from "@/features/auth/context/useAuth";
import { BookRankingSection } from "@/pages/home/components/BookRankingSection";
import { HomeHeader } from "@/pages/home/components/HomeHeader";
import { RecommendationSection } from "@/pages/home/components/RecommendationSection";

const UNAVAILABLE_NOTICE = "아직 준비 중인 기능이에요";

export function HomePage() {
  const { status } = useAuth();
  const { notice, showNotice } = useTransientNotice();
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLElement>(null);
  const homeScrollTop = (location.state as { homeScrollTop?: unknown } | null)
    ?.homeScrollTop;

  useLayoutEffect(() => {
    if (typeof homeScrollTop === "number" && mainRef.current) {
      mainRef.current.scrollTop = homeScrollTop;
    }
  }, [homeScrollTop]);

  const showUnavailableNotice = () => showNotice(UNAVAILABLE_NOTICE);
  const handleSearchSubmit = (query: string) => {
    navigate({
      pathname: "/search",
      search: createSearchParams({ q: query, sort: "popular" }).toString(),
    });
  };
  const rememberHomeScroll = () => {
    navigate(
      {
        hash: location.hash,
        pathname: location.pathname,
        search: location.search,
      },
      {
        replace: true,
        state: { homeScrollTop: mainRef.current?.scrollTop ?? 0 },
      },
    );
  };

  return (
    <div className="relative flex h-dvh flex-col bg-surface">
      <HomeHeader
        onCartClick={() => navigate("/cart")}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* Content APIs require a token, so nothing loads until the session is known. */}
      <main className="min-h-0 flex-1 overflow-y-auto" ref={mainRef}>
        {status === "authenticated" ? (
          <div className="flex flex-col gap-8 py-6">
            <BookRankingSection
              onMoreClick={() => navigate("/catalog/ranking")}
              onProductClick={rememberHomeScroll}
            />
            <RecommendationSection
              onMoreClick={() => navigate("/catalog/recommendations")}
            />
          </div>
        ) : null}
        {status === "unauthenticated" ? (
          <div className="page-content">
            <LoginRequired description="로그인 후 맞춤 도서와 책 랭킹을 확인할 수 있어요" />
          </div>
        ) : null}
      </main>

      {notice ? (
        <div className="page-content pointer-events-none absolute inset-x-0 bottom-20">
          <Toast>{notice}</Toast>
        </div>
      ) : null}

      <BottomNavigation onUnavailableTabClick={showUnavailableNotice} />
    </div>
  );
}
