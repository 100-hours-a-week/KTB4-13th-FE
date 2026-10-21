import { Outlet } from "react-router-dom";

import { BottomNavigation } from "@/common/components/BottomNavigation";

// Service pages render inside the remaining height so the shared tab bar never covers their content.
export function BottomNavigationLayout() {
  return (
    <div className="flex h-dvh min-w-0 flex-col bg-surface">
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </div>
      <BottomNavigation />
    </div>
  );
}
