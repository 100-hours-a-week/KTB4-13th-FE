import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { BottomNavigation } from "@/common/components/BottomNavigation";
import { Toast } from "@/common/components/Toast";
import { RetryButton } from "@/common/components/RetryButton";
import { CartButton } from "@/features/cart/components/CartButton";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { fetchMyProfile } from "@/features/profile/api/profileApi";
import { getProfileImage } from "@/features/profile/lib/profileImageStore";
import { LogoutDialog } from "@/pages/my/components/LogoutDialog";

interface MenuLinkProps {
  description?: string;
  label: string;
  to: string;
}

function MenuLink({ description, label, to }: MenuLinkProps) {
  return (
    <Link
      className="flex min-h-14 items-center justify-between gap-3 border-b border-hairline py-2 text-text-primary transition-colors last:border-b-0 hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      to={to}
    >
      <span className="min-w-0">
        <span className="block type-body font-medium">{label}</span>
        {description ? (
          <span className="mt-0.5 block type-caption text-text-tertiary">
            {description}
          </span>
        ) : null}
      </span>
      <span aria-hidden="true" className="type-heading text-text-tertiary">
        ›
      </span>
    </Link>
  );
}

export function MyPage() {
  const { logout } = useLogout();
  const navigate = useNavigate();
  const location = useLocation();
  const [nickname, setNickname] = useState("");
  const [profileError, setProfileError] = useState(false);
  const [profileRequestKey, setProfileRequestKey] = useState(0);
  const [imageDataUrl] = useState(getProfileImage);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const isLogoutRequestedRef = useRef(false);
  const notice = typeof location.state === "object" && location.state !== null && typeof Reflect.get(location.state, "notice") === "string" ? String(Reflect.get(location.state, "notice")) : null;

  useEffect(() => {
    const controller = new AbortController();

    void fetchMyProfile(controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      if (result.ok) {
        setNickname(result.nickname);
        return;
      }
      setProfileError(true);
    });

    return () => controller.abort();
  }, [profileRequestKey]);

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
      <header className="page-content grid min-h-16 shrink-0 grid-cols-[2.75rem_1fr_2.75rem] items-center border-b border-hairline bg-surface">
        <Link
          aria-label="홈으로 이동"
          className="-ml-1 inline-flex size-10 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          to="/"
        >
          <img
            alt=""
            className="size-9 object-contain"
            src={`${import.meta.env.BASE_URL}assets/bookjeok-logo-mark.png`}
          />
        </Link>
        <h1 className="text-center type-title text-text-primary">마이페이지</h1>
        <CartButton
          className="inline-flex size-11 items-center justify-center text-text-secondary hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          countEnabled
          onClick={() => navigate("/cart")}
        />
      </header>

      <main className="page-content min-h-0 flex-1 space-y-6 overflow-y-auto py-5">
        {notice ? <Toast>{notice}</Toast> : null}
        {profileError ? <Toast action={<RetryButton onClick={() => { setProfileError(false); setProfileRequestKey((value) => value + 1); }} />} variant="error">내 정보를 불러오지 못했어요</Toast> : null}
        <section
          aria-labelledby="my-profile-title"
          className="flex items-center gap-3 rounded-panel border border-border p-4"
        >
          {imageDataUrl ? <img alt="프로필" className="size-12 shrink-0 rounded-full object-cover" src={imageDataUrl} /> : <div
            aria-hidden="true"
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent-soft font-brand text-lg text-accent"
          >
            {nickname.slice(0, 1) || "책"}
          </div>}
          <div className="min-w-0">
            <h2 className="type-title text-text-primary" id="my-profile-title">
              {nickname ? `${nickname}님` : "내 정보를 불러오는 중이에요"}
            </h2>
            <p className="mt-0.5 type-caption text-text-tertiary">
              카카오 계정으로 로그인
            </p>
          </div>
          <Link className="ml-auto inline-flex min-h-11 items-center px-2 type-caption font-semibold text-text-secondary" to="/my/profile">수정</Link>
        </section>

        <section aria-labelledby="my-activity-title">
          <h2
            className="type-caption font-semibold text-text-tertiary"
            id="my-activity-title"
          >
            활동
          </h2>
          <div className="mt-2 border-y border-hairline">
            <MenuLink label="주문내역" to="/my/orders" />
            <MenuLink description="내가 담아둔 책 모아보기" label="나의 도서관" to="/my/library" />
            <MenuLink description="AI가 기억한 독서 취향 관리" label="취향 정보 수정" to="/my/preferences" />
          </div>
        </section>

        <section aria-labelledby="my-settings-title">
          <h2
            className="type-caption font-semibold text-text-tertiary"
            id="my-settings-title"
          >
            설정
          </h2>
          <div className="mt-2 border-y border-hairline">
            <MenuLink
              description="배송지 등록·수정·기본 배송지 설정"
              label="배송지 관리"
              to="/my/addresses"
            />
            <MenuLink label="회원탈퇴" to="/my/withdraw" />
            <button
              className="flex min-h-14 w-full items-center justify-between border-b border-hairline py-2 text-left type-body font-medium text-text-primary transition-colors last:border-b-0 hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={() => setIsLogoutDialogOpen(true)}
              type="button"
            >
              로그아웃
              <span aria-hidden="true" className="type-heading text-text-tertiary">
                ›
              </span>
            </button>
          </div>
        </section>
      </main>

      <BottomNavigation />
      <LogoutDialog
        isLoggingOut={isLoggingOut}
        isOpen={isLogoutDialogOpen}
        onCancel={() => setIsLogoutDialogOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
