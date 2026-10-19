import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

import { ArrowLeftIcon } from "@/common/components/AppIcons";
import { useAuth } from "@/features/auth/context/useAuth";
import { CartButton } from "@/features/cart/components/CartButton";

interface AppPageHeaderProps {
  action?: ReactNode;
  fallbackPath?: string;
  showCart?: boolean;
  title: string;
}

export function AppPageHeader({
  action,
  fallbackPath = "/",
  showCart = true,
  title,
}: AppPageHeaderProps) {
  const navigate = useNavigate();
  const { status } = useAuth();
  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate(fallbackPath, { replace: true });
  };

  return (
    <header className="page-content grid min-h-16 shrink-0 grid-cols-[2.75rem_1fr_2.75rem] items-center border-b border-hairline bg-surface">
      <button
        aria-label="뒤로 가기"
        className="-ml-2 inline-flex size-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        onClick={goBack}
        type="button"
      >
        <ArrowLeftIcon className="size-6" />
      </button>
      <h1 className="truncate text-center type-title text-text-primary">{title}</h1>
      {action ??
        (showCart ? (
          <CartButton
            className="inline-flex size-11 items-center justify-center text-text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            countEnabled={status === "authenticated"}
            onClick={() => navigate("/cart")}
          />
        ) : (
          <span />
        ))}
    </header>
  );
}
