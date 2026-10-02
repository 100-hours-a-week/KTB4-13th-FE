import { useLayoutEffect, useRef, useState } from "react";
import {
  createSearchParams,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { BottomNavigation } from "@/common/components/BottomNavigation";
import { LoginRequiredDialog } from "@/features/auth/components/LoginRequiredDialog";
import { useAuth } from "@/features/auth/context/useAuth";
import { BookRankingSection } from "@/pages/home/components/BookRankingSection";
import { GuestRecommendationBanner } from "@/pages/home/components/GuestRecommendationBanner";
import { HomeHeader } from "@/pages/home/components/HomeHeader";
import { RecommendationSection } from "@/pages/home/components/RecommendationSection";

type HomeLoginPrompt = "cart" | "login" | "recommendation";

const LOGIN_PROMPT_CONTENT: Record<
  HomeLoginPrompt,
  { description: string; returnTo: string; title: string }
> = {
  cart: {
    description: "로그인하면 장바구니에 담은 책을 확인할 수 있어요.",
    returnTo: "/cart",
    title: "장바구니를 이용하려면 로그인이 필요해요",
  },
  login: {
    description: "취향에 맞는 책을 찾고 필요한 기능을 이어갈 수 있어요.",
    returnTo: "/",
    title: "로그인하고 북적북적을 이용해보세요",
  },
  recommendation: {
    description: "로그인하면 나만의 추천 도서를 볼 수 있어요.",
    returnTo: "/",
    title: "취향에 맞는 추천을 준비해드릴게요",
  },
};

export function HomePage() {
  const { status } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLElement>(null);
  const [loginPrompt, setLoginPrompt] = useState<HomeLoginPrompt | null>(null);
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
        isGuest={status === "unauthenticated"}
        onCartClick={() => {
          if (status === "unauthenticated") {
            setLoginPrompt("cart");
            return;
          }
          navigate("/cart");
        }}
        onLoginClick={() => setLoginPrompt("login")}
        onSearchSubmit={handleSearchSubmit}
      />

      <main className="min-h-0 flex-1 overflow-y-auto" ref={mainRef}>
        <div className="flex flex-col divide-y divide-hairline pb-6">
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
            <GuestRecommendationBanner
              onLoginClick={() => setLoginPrompt("recommendation")}
            />
          ) : null}
        </div>
      </main>

      <BottomNavigation />
      <LoginRequiredDialog
        description={LOGIN_PROMPT_CONTENT[loginPrompt ?? "cart"].description}
        isOpen={loginPrompt !== null}
        onClose={() => setLoginPrompt(null)}
        returnTo={LOGIN_PROMPT_CONTENT[loginPrompt ?? "cart"].returnTo}
        title={LOGIN_PROMPT_CONTENT[loginPrompt ?? "cart"].title}
      />
    </div>
  );
}
