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
        onCartClick={() =>
          navigate(status === "unauthenticated" ? "/login" : "/cart")
        }
        onSearchSubmit={handleSearchSubmit}
      />

      <main className="min-h-0 flex-1 overflow-y-auto" ref={mainRef}>
        <div className="flex flex-col gap-8 py-6">
          <BookRankingSection
            onMoreClick={() => navigate("/catalog/ranking")}
            onProductClick={rememberHomeScroll}
          />
          {/* The feed requires a token, so guests never mount the section or request it. */}
          {status === "authenticated" ? (
            <RecommendationSection
              onMoreClick={() => navigate("/catalog/recommendations")}
              onProductClick={rememberHomeScroll}
            />
          ) : null}
          {status === "unauthenticated" ? (
            <div className="page-content">
              <LoginRequired description="로그인하고 취향에 맞는 도서를 추천받아 보세요" />
            </div>
          ) : null}
        </div>
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
