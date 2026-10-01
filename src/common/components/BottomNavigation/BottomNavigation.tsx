import { Link, useLocation } from "react-router-dom";

import {
  BellIcon,
  HomeIcon,
  SparkleIcon,
  UserIcon,
} from "@/common/components/AppIcons";

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

interface BottomNavigationProps {
  onUnavailableTabClick: () => void;
}

export function BottomNavigation({
  onUnavailableTabClick,
}: BottomNavigationProps) {
  const { pathname } = useLocation();
  const isAiRecommendationActive = pathname === AI_RECOMMENDATION_PATH;
  const isMyActive = pathname === MY_PATH || pathname.startsWith(`${MY_PATH}/`);
  // Home stays highlighted on every screen not owned by another available tab.
  const isHomeActive = !isAiRecommendationActive && !isMyActive;

  return (
    <nav
      aria-label="주요 메뉴"
      className="w-full min-w-0 shrink-0 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-4">
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
          {/* Guests are sent to /login by RequireAuth, like every other protected route. */}
          <Link
            aria-current={isAiRecommendationActive ? "page" : undefined}
            className={
              isAiRecommendationActive ? activeTabClassName : inactiveTabClassName
            }
            to={AI_RECOMMENDATION_PATH}
          >
            {isAiRecommendationActive ? <ActiveIndicator /> : null}
            <SparkleIcon className="size-6" />
            AI 추천
          </Link>
        </li>
        <li>
          <button
            className={inactiveTabClassName}
            onClick={onUnavailableTabClick}
            type="button"
          >
            <BellIcon className="size-6" />
            알림
          </button>
        </li>
        <li>
          <Link
            aria-current={isMyActive ? "page" : undefined}
            className={isMyActive ? activeTabClassName : inactiveTabClassName}
            to={MY_PATH}
          >
            {isMyActive ? <ActiveIndicator /> : null}
            <UserIcon className="size-6" />
            마이
          </Link>
        </li>
      </ul>
    </nav>
  );
}
