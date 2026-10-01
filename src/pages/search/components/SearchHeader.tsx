import { useState, type FormEvent } from "react";

import { ArrowLeftIcon, SearchIcon } from "@/common/components/AppIcons";

interface SearchHeaderProps {
  onBack: () => void;
  onSubmit: (query: string) => void;
  submittedQuery: string;
}

export function SearchHeader({
  onBack,
  onSubmit,
  submittedQuery,
}: SearchHeaderProps) {
  const [inputValue, setInputValue] = useState(submittedQuery);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = inputValue.trim();

    if (!nextQuery) {
      return;
    }

    setInputValue(nextQuery);
    onSubmit(nextQuery);
  };

  return (
    <header className="shrink-0 border-b border-border bg-surface">
      <div className="page-content flex min-h-14 items-center gap-2">
        <button
          aria-label="이전 화면으로 돌아가기"
          className="-ml-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-text-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={onBack}
          type="button"
        >
          <ArrowLeftIcon className="size-6" />
        </button>
        <h1 className="type-heading text-text-primary">검색결과</h1>
      </div>

      <form className="page-content pb-3" onSubmit={handleSubmit} role="search">
        <label className="flex min-h-11 items-center gap-2 rounded-control border border-border bg-muted px-3 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
          <SearchIcon className="size-5 shrink-0 text-text-tertiary" />
          <span className="sr-only">검색어</span>
          <input
            autoComplete="off"
            className="min-w-0 flex-1 appearance-none bg-transparent py-2 type-body-small text-text-primary outline-none placeholder:text-text-tertiary [&::-webkit-search-cancel-button]:appearance-none"
            maxLength={200}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="궁금한 책을 검색해보세요"
            type="search"
            value={inputValue}
          />
          {inputValue ? (
            <button
              aria-label="검색어 지우기"
              className="-mr-2 inline-flex size-10 shrink-0 items-center justify-center rounded-full type-title text-text-tertiary hover:bg-surface hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={() => setInputValue("")}
              type="button"
            >
              <span aria-hidden="true">×</span>
            </button>
          ) : null}
        </label>
      </form>
    </header>
  );
}
