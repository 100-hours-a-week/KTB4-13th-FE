import { useLayoutEffect, useRef, useState } from "react";
import {
  createSearchParams,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { BottomNavigation } from "@/common/components/BottomNavigation";
import { LoginRequiredDialog } from "@/features/auth/components/LoginRequiredDialog";
import { LoginRequired } from "@/features/auth/components/LoginRequired";
import { useAuth } from "@/features/auth/context/useAuth";
import { BookRankingSection } from "@/pages/home/components/BookRankingSection";
import { HomeHeader } from "@/pages/home/components/HomeHeader";
import { RecommendationSection } from "@/pages/home/components/RecommendationSection";

export function HomePage() {
  const { status } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLElement>(null);
  const [isCartLoginDialogOpen, setIsCartLoginDialogOpen] = useState(false);
  const homeScrollTop = (location.state as { homeScrollTop?: unknown } | null)
    ?.homeScrollTop;

  useLayoutEffect(() => {
    if (typeof homeScrollTop === "number" && mainRef.current) {
      mainRef.current.scrollTop = homeScrollTop;
    }
  }, [homeScrollTop]);

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
        onCartClick={() => {
          if (status === "unauthenticated") {
            setIsCartLoginDialogOpen(true);
            return;
          }
          navigate("/cart");
        }}
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
              <LoginRequired
                actionLabel="로그인하고 추천받기"
                description="로그인하면 나만의 추천을 받을 수 있어요"
                title="취향에 맞는 책을 찾아드릴게요"
              />
            </div>
          ) : null}
        </div>
      </main>

      <BottomNavigation />
      <LoginRequiredDialog
        description="로그인하면 장바구니에 담은 책을 확인할 수 있어요."
        isOpen={isCartLoginDialogOpen}
        onClose={() => setIsCartLoginDialogOpen(false)}
        returnTo="/cart"
        title="장바구니를 이용하려면 로그인이 필요해요"
      />
    </div>
  );
}
