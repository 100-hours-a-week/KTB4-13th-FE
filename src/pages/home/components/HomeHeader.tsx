import { CartButton } from "@/features/cart/components/CartButton";

interface HomeHeaderProps {
  isGuest: boolean;
  onCartClick: () => void;
  onLoginClick: () => void;
}

// Only the logo and cart row stays fixed. The search block scrolls with the page (HomeSearchHero),
// so the fixed area is this row plus the bottom tabs instead of 38% of a 375x812 screen (FE #194).
export function HomeHeader({
  isGuest,
  onCartClick,
  onLoginClick,
}: HomeHeaderProps) {
  return (
    <header className="page-content shrink-0 bg-background pb-1 pt-3">
      <div className="flex items-center justify-between">
        <h1>
          <img
            alt="북적북적"
            className="size-10 object-contain"
            src={`${import.meta.env.BASE_URL}assets/bookjeok-logo-mark.png`}
          />
        </h1>
        <div className="-mr-2 flex items-center gap-1">
          {isGuest ? (
            <button
              className="inline-flex min-h-11 items-center px-2 type-body-small font-medium text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={onLoginClick}
              type="button"
            >
              로그인
            </button>
          ) : null}
          <CartButton
            className="inline-flex size-11 items-center justify-center text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            countEnabled={!isGuest}
            onClick={onCartClick}
          />
        </div>
      </div>
    </header>
  );
}
