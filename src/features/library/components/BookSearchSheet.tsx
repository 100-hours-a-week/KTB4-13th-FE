import { useEffect, useEffectEvent, useId, useState } from "react";

import { BookCover } from "@/common/components/BookCover";
import { Button } from "@/common/components/Button";
import { RetryButton } from "@/common/components/RetryButton";
import { LibrarySheet } from "@/features/library/components/LibrarySheet";
import type { PhotoScanSearchBook, SearchBooks } from "@/features/library/types/photoScan";

// idle: 고를 수 있다, busy: 고른 책을 담는 중, done: 이미 담겨 있다
export type BookPickState = "idle" | "busy" | "done";

interface BookSearchSheetProps {
  // 사진 속 책과 같은 책을 골라 달라는 식의 안내
  hint: string;
  // 사진에서 읽은 글자. 비어 있지 않으면 열자마자 이 글자로 찾는다
  initialQuery: string;
  onClose: () => void;
  onPick: (book: PhotoScanSearchBook) => void;
  pickLabel?: string;
  pickState?: (book: PhotoScanSearchBook) => BookPickState;
  searchBooks: SearchBooks;
  title: string;
}

type SearchState =
  | { status: "loading" }
  | { books: PhotoScanSearchBook[]; status: "ready" }
  | { reason: "rate_limited" | "error"; status: "failed" };

function bookMeta(book: PhotoScanSearchBook) {
  return [book.author, book.publisher].filter(Boolean).join(" · ");
}

// 책을 검색해서 고른다. 사진에서 못 찾은 책을 고르거나(담기는 결과 화면에서), 나의 도서관에 제목으로 바로 담을 때 쓴다
export function BookSearchSheet({
  hint,
  initialQuery,
  onClose,
  onPick,
  pickLabel = "고르기",
  pickState = () => "idle",
  searchBooks,
  title,
}: BookSearchSheetProps) {
  const inputId = useId();
  const [draft, setDraft] = useState(initialQuery.trim());
  // 마지막으로 찾은 검색어. 다시 시도하면 attempt 만 올린다
  const [search, setSearch] = useState({ attempt: 0, query: initialQuery.trim() });
  const [result, setResult] = useState<{ search: typeof search; state: SearchState } | null>(null);
  const callSearchBooks = useEffectEvent((...args: Parameters<SearchBooks>) => searchBooks(...args));

  useEffect(() => {
    if (!search.query) return;
    const controller = new AbortController();
    void callSearchBooks(search.query, controller.signal).then((response) => {
      if (controller.signal.aborted) return;
      setResult({
        search,
        state: response.ok ? { books: response.data, status: "ready" } : { reason: response.reason, status: "failed" },
      });
    });
    return () => controller.abort();
  }, [search]);

  const state: SearchState | null = !search.query ? null : result?.search === search ? result.state : { status: "loading" };

  return (
    <LibrarySheet isOpen onClose={onClose} title={title}>
      <form
        className="mt-1 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const query = draft.trim();
          if (query) setSearch((current) => ({ attempt: current.attempt + 1, query }));
        }}
        role="search"
      >
        <label className="sr-only" htmlFor={inputId}>책 제목이나 저자</label>
        <input
          // 검색어 없이 열면(제목으로 담기) 바로 칠 수 있게 한다
          autoFocus={!initialQuery.trim()}
          className="min-h-11 min-w-0 flex-1 rounded-control border border-border bg-surface px-3 type-body-small focus-visible:outline-2 focus-visible:outline-primary"
          enterKeyHint="search"
          id={inputId}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="책 제목이나 저자"
          type="search"
          value={draft}
        />
        <Button className="shrink-0" disabled={!draft.trim()} type="submit">검색</Button>
      </form>
      <p className="mt-2 type-caption text-text-secondary">{hint}</p>

      <div aria-live="polite" className="mt-2">
        {state?.status === "loading" ? (
          <p aria-busy="true" className="py-6 text-center type-body-small text-text-secondary" role="status">찾는 중이에요</p>
        ) : null}
        {state?.status === "failed" ? (
          <div className="flex flex-col items-center py-6 text-center">
            <p className="type-body-small text-text-secondary">
              {state.reason === "rate_limited" ? "검색이 많아요. 잠시 뒤에 다시 시도해 주세요." : "검색하지 못했어요."}
            </p>
            <div className="mt-3">
              <RetryButton onClick={() => setSearch((current) => ({ ...current, attempt: current.attempt + 1 }))} />
            </div>
          </div>
        ) : null}
        {state?.status === "ready" && state.books.length === 0 ? (
          <p className="py-6 text-center type-body-small text-text-secondary">검색 결과가 없어요. 제목을 줄여서 찾아보세요.</p>
        ) : null}
        {state?.status === "ready" && state.books.length > 0 ? (
          <ul>
            {state.books.map((book) => {
              const pick = pickState(book);
              return (
                <li className="border-t border-hairline" key={book.bookId}>
                  <button
                    aria-disabled={pick !== "idle" || undefined}
                    className="flex w-full items-start gap-3 py-3 text-left focus-visible:outline-2 focus-visible:outline-primary aria-disabled:cursor-default"
                    onClick={() => {
                      if (pick === "idle") onPick(book);
                    }}
                    type="button"
                  >
                    <span className="w-11 shrink-0">
                      <BookCover alt="" fallbackTitle={book.title} radius="control" thumbnailUrl={book.coverUrl} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 type-body-small font-semibold">{book.title}</span>
                      <span className="block truncate text-xs leading-[1.125rem] text-text-secondary">{bookMeta(book)}</span>
                    </span>
                    <span
                      aria-live="polite"
                      className={`shrink-0 self-center type-caption font-semibold ${pick === "idle" ? "text-primary" : "text-text-tertiary"}`}
                    >
                      {pick === "done" ? "담았어요" : pick === "busy" ? "담는 중" : pickLabel}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </LibrarySheet>
  );
}
