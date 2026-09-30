import type { ComponentType, SVGProps } from "react";
import { Link } from "react-router-dom";

import {
  BellIcon,
  HomeIcon,
  SparkleIcon,
  UserIcon,
} from "@/common/components/AppIcons";

type NavigationIcon = ComponentType<SVGProps<SVGSVGElement>>;

const tabClassName =
  "relative flex min-h-14 w-full flex-col items-center justify-center gap-0.5 type-caption focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary";

function DisabledTab({
  icon: Icon,
  label,
}: {
  icon: NavigationIcon;
  label: string;
}) {
  return (
    <button
      className={`${tabClassName} text-text-tertiary disabled:cursor-not-allowed`}
      disabled
      type="button"
    >
      <Icon className="size-6" />
      {label}
    </button>
  );
}

export function ChatBottomNavigation() {
  return (
    <nav
      aria-label="주요 메뉴"
      className="w-full shrink-0 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-4">
        <li>
          <Link
            className={`${tabClassName} font-medium text-text-tertiary hover:text-text-secondary`}
            to="/"
          >
            <HomeIcon className="size-6" />홈
          </Link>
        </li>
        <li>
          <span
            aria-current="page"
            className={`${tabClassName} font-semibold text-text-primary`}
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-primary"
            />
            <SparkleIcon className="size-6" />AI 추천
          </span>
        </li>
        <li>
          <DisabledTab icon={BellIcon} label="알림" />
        </li>
        <li>
          <DisabledTab icon={UserIcon} label="마이" />
        </li>
      </ul>
    </nav>
  );
}
