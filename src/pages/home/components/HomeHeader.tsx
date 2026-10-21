import type { FormEvent } from "react";

import { SearchIcon, SparkleIcon } from "@/common/components/AppIcons";
import { CartButton } from "@/features/cart/components/CartButton";

interface HomeHeaderProps {
  isGuest: boolean;
  onCartClick: () => void;
  onLoginClick: () => void;
  onSearchSubmit: (query: string) => void;
}

export function HomeHeader({
  isGuest,
  onCartClick,
  onLoginClick,
  onSearchSubmit,
}: HomeHeaderProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = new FormData(event.currentTarget).get("query");

    if (typeof query === "string" && query.trim()) {
      onSearchSubmit(query.trim());
    }
  };

  return (
    <header className="page-content shrink-0 bg-background pb-6 pt-3">
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
      <div className="mt-6 text-center">
        <p className="flex items-center justify-center gap-1.5 type-caption font-semibold tracking-wide text-accent">
          <SparkleIcon className="size-4" />
          AI 도서 검색
        </p>
        <p className="mx-auto mt-2 max-w-xs type-display text-text-primary">
          어떤 책을 찾고 있나요?
        </p>
        <form className="ai-search-border mt-5 text-left" onSubmit={handleSubmit} role="search">
          <div className="flex min-h-14 items-center gap-2 rounded-[0.75rem] bg-surface pl-4 pr-2 shadow-[0_8px_24px_-18px_rgba(36,33,31,0.65)]">
            <label className="flex min-w-0 flex-1 items-center gap-3">
              <SearchIcon className="size-5 shrink-0 text-text-tertiary" />
              <span className="sr-only">도서 검색</span>
              <input
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent py-3 type-body text-text-primary outline-none placeholder:text-text-tertiary"
                maxLength={200}
                name="query"
                placeholder="제목, 작가 또는 문장으로 찾아보세요"
                type="search"
              />
            </label>
            <button
              aria-label="검색"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-control bg-primary text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              type="submit"
            >
              <SearchIcon className="size-5" />
            </button>
          </div>
        </form>
      </div>
    </header>
  );
}
