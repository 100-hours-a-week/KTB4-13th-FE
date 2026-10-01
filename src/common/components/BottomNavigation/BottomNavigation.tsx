import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  HomeIcon,
  SparkleIcon,
  UserIcon,
} from "@/common/components/AppIcons";
import { LoginRequiredDialog } from "@/features/auth/components/LoginRequiredDialog";
import { useAuth } from "@/features/auth/context/useAuth";

const AI_RECOMMENDATION_PATH = "/recommendations/chat";
const MY_PATH = "/my";

const tabClassName =
  "relative flex min-h-14 w-full flex-col items-center justify-center gap-0.5 type-caption transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary";
const activeTabClassName = `${tabClassName} font-semibold text-text-primary`;
const inactiveTabClassName = `${tabClassName} font-medium text-text-tertiary hover:text-text-secondary`;

function ActiveIndicator() {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-primary"
    />
  );
}

type LoginPrompt = {
  description: string;
  returnTo: string;
  title: string;
};

export function BottomNavigation() {
  const { pathname } = useLocation();
  const { status } = useAuth();
  const [loginPrompt, setLoginPrompt] = useState<LoginPrompt | null>(null);
  const isAiRecommendationActive = pathname === AI_RECOMMENDATION_PATH;
  const isMyActive = pathname === MY_PATH || pathname.startsWith(`${MY_PATH}/`);
  // Home stays highlighted on every screen not owned by another available tab.
  const isHomeActive = !isAiRecommendationActive && !isMyActive;

  const isGuest = status === "unauthenticated";

  return (
    <>
      <nav
        aria-label="주요 메뉴"
        className="w-full min-w-0 shrink-0 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="grid grid-cols-3">
          <li>
            <Link
              aria-current={isHomeActive ? "page" : undefined}
              className={isHomeActive ? activeTabClassName : inactiveTabClassName}
              to="/"
            >
              {isHomeActive ? <ActiveIndicator /> : null}
              <HomeIcon className="size-6" />홈
            </Link>
          </li>
          <li>
            {isGuest ? (
              <button
                className={inactiveTabClassName}
                onClick={() =>
                  setLoginPrompt({
                    description:
                      "취향을 바탕으로 나에게 맞는 책을 추천해드릴게요.",
                    returnTo: AI_RECOMMENDATION_PATH,
                    title: "AI 추천은 로그인 후 이용할 수 있어요",
                  })
                }
                type="button"
              >
                <SparkleIcon className="size-6" />
                AI 추천
              </button>
            ) : (
              <Link
                aria-current={isAiRecommendationActive ? "page" : undefined}
                className={
                  isAiRecommendationActive
                    ? activeTabClassName
                    : inactiveTabClassName
                }
                to={AI_RECOMMENDATION_PATH}
              >
                {isAiRecommendationActive ? <ActiveIndicator /> : null}
                <SparkleIcon className="size-6" />
                AI 추천
              </Link>
            )}
          </li>
          <li>
            {isGuest ? (
              <button
                className={inactiveTabClassName}
                onClick={() =>
                  setLoginPrompt({
                    description: "로그인하면 내 정보와 배송지를 관리할 수 있어요.",
                    returnTo: MY_PATH,
                    title: "마이페이지는 로그인 후 이용할 수 있어요",
                  })
                }
                type="button"
              >
                <UserIcon className="size-6" />
                마이
              </button>
            ) : (
              <Link
                aria-current={isMyActive ? "page" : undefined}
                className={isMyActive ? activeTabClassName : inactiveTabClassName}
                to={MY_PATH}
              >
                {isMyActive ? <ActiveIndicator /> : null}
                <UserIcon className="size-6" />
                마이
              </Link>
            )}
          </li>
        </ul>
      </nav>
      <LoginRequiredDialog
        description={loginPrompt?.description ?? ""}
        isOpen={loginPrompt !== null}
        onClose={() => setLoginPrompt(null)}
        returnTo={loginPrompt?.returnTo ?? "/"}
        title={loginPrompt?.title ?? ""}
      />
    </>
  );
}
