import type { ComponentType, SVGProps } from "react";
import { Link } from "react-router-dom";

import {
  BellIcon,
  HomeIcon,
  SparkleIcon,
  UserIcon,
} from "@/common/components/AppIcons";

type NavIcon = ComponentType<SVGProps<SVGSVGElement>>;

// TODO: Link these tabs once the AI recommendation, notification, and my page routes exist.
const unavailableTabs: { icon: NavIcon; label: string }[] = [
  { icon: SparkleIcon, label: "AI 추천" },
  { icon: BellIcon, label: "알림" },
  { icon: UserIcon, label: "마이" },
];

const tabClassName =
  "relative flex min-h-14 w-full flex-col items-center justify-center gap-0.5 type-caption transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary";

interface BottomNavigationProps {
  onUnavailableTabClick: () => void;
}

export function BottomNavigation({
  onUnavailableTabClick,
}: BottomNavigationProps) {
  return (
    <nav
      aria-label="주요 메뉴"
      className="shrink-0 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-4">
        <li>
          <Link
            aria-current="page"
            className={`${tabClassName} font-semibold text-text-primary`}
            to="/"
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-primary"
            />
            <HomeIcon className="size-6" />홈
          </Link>
        </li>
        {unavailableTabs.map(({ icon: TabIcon, label }) => (
          <li key={label}>
            <button
              className={`${tabClassName} font-medium text-text-tertiary hover:text-text-secondary`}
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
