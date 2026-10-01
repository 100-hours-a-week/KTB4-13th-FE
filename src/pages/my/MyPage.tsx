import { useRef, useState } from "react";

import { BottomNavigation } from "@/common/components/BottomNavigation";
import { Button } from "@/common/components/Button";
import { Toast } from "@/common/components/Toast";
import { useTransientNotice } from "@/common/hooks/useTransientNotice";
import { useLogout } from "@/features/auth/hooks/useLogout";

const ADDRESS_UNAVAILABLE_NOTICE = "배송지 관리 기능을 준비하고 있어요";
const NAVIGATION_UNAVAILABLE_NOTICE = "아직 준비 중인 기능이에요";

export function MyPage() {
  const { logout } = useLogout();
  const { notice, showNotice } = useTransientNotice();
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
        <button
          className="flex min-h-14 w-full items-center justify-between border-b border-border text-left text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={() => showNotice(ADDRESS_UNAVAILABLE_NOTICE)}
          type="button"
        >
          <span className="type-title">배송지 관리</span>
          <span aria-hidden="true" className="type-heading text-text-tertiary">
            ›
          </span>
        </button>

        <Button
          className="mt-6 w-full"
          isLoading={isLoggingOut}
          onClick={handleLogout}
          variant="secondary"
        >
          {isLoggingOut ? "로그아웃 중" : "로그아웃"}
        </Button>
      </main>

      {notice ? (
        <div className="page-content pointer-events-none absolute inset-x-0 bottom-20">
          <Toast>{notice}</Toast>
        </div>
      ) : null}

      <BottomNavigation
        onUnavailableTabClick={() =>
          showNotice(NAVIGATION_UNAVAILABLE_NOTICE)
        }
      />
    </div>
  );
}
