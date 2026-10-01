import { useRef, useState } from "react";
import { Link } from "react-router-dom";

import { BottomNavigation } from "@/common/components/BottomNavigation";
import { Button } from "@/common/components/Button";
import { useLogout } from "@/features/auth/hooks/useLogout";

export function MyPage() {
  const { logout } = useLogout();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isLogoutRequestedRef = useRef(false);

  const handleLogout = async () => {
    if (isLogoutRequestedRef.current) {
      return;
    }

    isLogoutRequestedRef.current = true;
    setIsLoggingOut(true);
    await logout();
  };

  return (
    <div className="relative flex h-dvh min-w-0 flex-col bg-surface">
      <header className="page-content flex min-h-14 shrink-0 items-center border-b border-border">
        <h1 className="type-heading text-text-primary">마이</h1>
      </header>

      <main className="page-content min-h-0 flex-1 overflow-y-auto py-6">
        <Link
          className="flex min-h-14 w-full items-center justify-between border-b border-border text-left text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          to="/my/addresses"
        >
          <span className="type-title">배송지 관리</span>
          <span aria-hidden="true" className="type-heading text-text-tertiary">
            ›
          </span>
        </Link>

        <Button
          className="mt-6 w-full"
          isLoading={isLoggingOut}
          onClick={handleLogout}
          variant="secondary"
        >
          {isLoggingOut ? "로그아웃 중" : "로그아웃"}
        </Button>
      </main>

      <BottomNavigation />
    </div>
  );
}
