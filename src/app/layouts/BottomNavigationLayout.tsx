import { Outlet, useLocation } from "react-router-dom";

import { BottomNavigation } from "@/common/components/BottomNavigation";
import { BookjeogiPeek } from "@/features/recommendation/components/BookjeogiPeek";

const PEEK_PATHS = new Set(["/", "/search", "/my"]);

// Service pages render inside the remaining height so the shared tab bar never covers their content.
export function BottomNavigationLayout() {
  const { pathname } = useLocation();

  return (
    <div className="flex h-dvh min-w-0 flex-col bg-surface">
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <Outlet />
        {PEEK_PATHS.has(pathname) ? <BookjeogiPeek key={pathname} /> : null}
      </div>
      <BottomNavigation />
    </div>
  );
}
