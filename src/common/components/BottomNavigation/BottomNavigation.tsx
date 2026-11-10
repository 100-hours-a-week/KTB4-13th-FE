import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  BellIcon,
  HomeIcon,
  SparkleIcon,
  UserIcon,
} from "@/common/components/AppIcons";
import { LoginRequiredDialog } from "@/features/auth/components/LoginRequiredDialog";
import { useAuth } from "@/features/auth/context/useAuth";

const AI_RECOMMENDATION_PATH = "/recommendations/chat";
const MY_PATH = "/my";
const NOTIFICATION_PATH = "/notifications";

const tabClassName =
  "relative flex min-h-14 w-full flex-col items-center justify-center gap-0.5 type-caption transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary";
const activeTabClassName = `${tabClassName} font-semibold text-text-primary`;
const inactiveTabClassName = `${tabClassName} font-medium text-text-tertiary hover:text-text-secondary`;

const TAB_COUNT = 4;

// One bar for all tabs that slides to the active one, instead of each tab drawing its own.
function SlidingIndicator({ index }: { index: number }) {
  return (
    <span
      aria-hidden="true"
      className="absolute top-0 h-0.5 rounded-full bg-primary transition-[left] duration-(--duration-base) ease-emphasized motion-reduce:transition-none"
      style={{
        left: `calc(${(index * 100) / TAB_COUNT}% + 1.5rem)`,
        width: `calc(${100 / TAB_COUNT}% - 3rem)`,
      }}
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
  const isNotificationActive = pathname === NOTIFICATION_PATH;
  // Home stays highlighted on every screen not owned by another available tab.
  const isHomeActive =
    !isAiRecommendationActive && !isMyActive && !isNotificationActive;

  const isGuest = status === "unauthenticated";
  const activeIndex = isAiRecommendationActive ? 1 : isNotificationActive ? 2 : isMyActive ? 3 : 0;

  return (
    <>
      <nav
        aria-label="주요 메뉴"
        className="relative w-full min-w-0 shrink-0 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
      >
        <SlidingIndicator index={activeIndex} />
        <ul className="grid grid-cols-4">
          <li>
            <Link
              aria-current={isHomeActive ? "page" : undefined}
              className={isHomeActive ? activeTabClassName : inactiveTabClassName}
              to="/"
            >
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
                    description: "로그인하면 주문과 추천 소식을 확인할 수 있어요.",
                    returnTo: NOTIFICATION_PATH,
                    title: "알림은 로그인 후 확인할 수 있어요",
                  })
                }
                type="button"
              >
                <BellIcon className="size-6" />알림
              </button>
            ) : (
              <Link
                aria-current={isNotificationActive ? "page" : undefined}
                className={isNotificationActive ? activeTabClassName : inactiveTabClassName}
                to={NOTIFICATION_PATH}
              >
                <BellIcon className="size-6" />알림
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
