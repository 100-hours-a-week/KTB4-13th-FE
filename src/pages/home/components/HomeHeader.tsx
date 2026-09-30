import type { FormEvent } from "react";

import { CartIcon, SearchIcon } from "@/common/components/AppIcons";

interface HomeHeaderProps {
  onCartClick: () => void;
  onSearchSubmit: (query: string) => void;
}

export function HomeHeader({ onCartClick, onSearchSubmit }: HomeHeaderProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = new FormData(event.currentTarget).get("query");

    if (typeof query === "string" && query.trim()) {
      onSearchSubmit(query.trim());
    }
  };

  return (
    <header className="page-content shrink-0 border-b border-border pb-3 pt-3">
      <div className="flex items-center justify-between">
        <h1 className="type-title font-bold text-text-primary">북적북적</h1>
        <button
          aria-label="장바구니"
          className="-mr-2 inline-flex size-11 items-center justify-center text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={onCartClick}
          type="button"
        >
          <CartIcon className="size-6" />
        </button>
      </div>
      <form className="mt-2" onSubmit={handleSubmit} role="search">
        <label className="flex min-h-11 items-center gap-2 rounded-control border border-border bg-muted px-3 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
          <SearchIcon className="size-5 shrink-0 text-text-tertiary" />
          <span className="sr-only">도서 검색</span>
          <input
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent py-2 type-body-small text-text-primary outline-none placeholder:text-text-tertiary"
            maxLength={200}
            name="query"
            placeholder="궁금한 책을 검색해보세요"
            type="search"
          />
        </label>
      </form>
    </header>
  );
}
