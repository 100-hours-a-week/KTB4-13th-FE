import { useLayoutEffect, useRef, useState } from "react";
import {
  createSearchParams,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { LoginRequiredDialog } from "@/features/auth/components/LoginRequiredDialog";
import { useAuth } from "@/features/auth/context/useAuth";
import { BookRankingSection } from "@/pages/home/components/BookRankingSection";
import { GuestRecommendationBanner } from "@/pages/home/components/GuestRecommendationBanner";
import { HomeHeader } from "@/pages/home/components/HomeHeader";
import { RecommendationSection } from "@/pages/home/components/RecommendationSection";
import { useBookRanking } from "@/pages/home/hooks/useBookRanking";

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
  const { ranking, retry: retryRanking } = useBookRanking();
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
    <div className="relative flex h-full flex-col bg-background">
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
        <div className="flex flex-col gap-3 pb-6">
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
              ranking={ranking}
            />
          ) : null}
          <BookRankingSection
            onMoreClick={() => navigate("/catalog/ranking")}
            onProductClick={rememberHomeScroll}
            ranking={ranking}
            retry={retryRanking}
          />
          <footer className="page-content mt-3 border-t border-hairline pt-5">
            <p className="type-caption leading-relaxed text-text-tertiary">
              본 사이트는 국립중앙도서관{" "}
              <a
                className="underline underline-offset-2 hover:text-text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                href="https://data4library.kr/"
                rel="noopener noreferrer"
                target="_blank"
              >
                도서관 정보나루
              </a>
              의 API 데이터를 활용하고 있습니다.
            </p>
          </footer>
        </div>
      </main>

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
