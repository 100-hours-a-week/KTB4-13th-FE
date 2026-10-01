import type { ComponentType, SVGProps } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  BellIcon,
  HomeIcon,
  SparkleIcon,
  UserIcon,
} from "@/common/components/AppIcons";

type NavIcon = ComponentType<SVGProps<SVGSVGElement>>;

const AI_RECOMMENDATION_PATH = "/recommendations/chat";

const unavailableTabs: { icon: NavIcon; label: string }[] = [
  { icon: BellIcon, label: "알림" },
  { icon: UserIcon, label: "마이" },
];

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
  // Home stays the highlighted tab on every other screen, as before.
  const isAiRecommendationActive = pathname === AI_RECOMMENDATION_PATH;

  return (
    <nav
      aria-label="주요 메뉴"
      className="w-full min-w-0 shrink-0 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-4">
        <li>
          <Link
            aria-current={isAiRecommendationActive ? undefined : "page"}
            className={
              isAiRecommendationActive ? inactiveTabClassName : activeTabClassName
            }
            to="/"
          >
            {isAiRecommendationActive ? null : <ActiveIndicator />}
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
        {unavailableTabs.map(({ icon: TabIcon, label }) => (
          <li key={label}>
            <button
              className={inactiveTabClassName}
              onClick={onUnavailableTabClick}
              type="button"
            >
              <TabIcon className="size-6" />
              {label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
