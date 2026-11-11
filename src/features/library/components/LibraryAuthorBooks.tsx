import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { BookCover } from "@/common/components/BookCover";
import { editionKey, normalizeAuthor } from "@/common/lib/authorName";
import type { LibraryAuthor } from "@/features/library/lib/libraryShelf";
import type { LibraryBook } from "@/features/library/types/library";
import type { PhotoScanSearchBook, SearchBooks } from "@/features/library/types/photoScan";

interface LibraryAuthorBooksProps {
  author: LibraryAuthor;
  books: LibraryBook[];
  searchBooks: SearchBooks;
}

const MAX_BOOKS = 3;

type AuthorBooksState =
  | { status: "idle" | "loading" | "failed" }
  | { books: PhotoScanSearchBook[]; status: "ready" };

// 이미 담은 책(같은 번호, 또는 괄호 말만 다른 다른 판본)과 판본 중복을 뺀다
function otherBooks(found: PhotoScanSearchBook[], author: string, owned: LibraryBook[]) {
  const authorKey = normalizeAuthor(author);
  const ownedIds = new Set(owned.map((book) => book.bookId));
  const seenTitles = new Set(owned.map((book) => editionKey(book.title)));
  const books: PhotoScanSearchBook[] = [];
  for (const book of found) {
    const title = editionKey(book.title);
    // 상품 상세 '저자의 다른 책'과 같은 규칙: 저자 이름이 통째로 같아야 한다
    if (book.author === null || normalizeAuthor(book.author) !== authorKey) continue;
    if (ownedIds.has(book.bookId) || seenTitles.has(title)) continue;
    seenTitles.add(title);
    books.push(book);
  }
  return books.slice(0, MAX_BOOKS);
}

// 도서관 아래 "○○의 다른 책" 줄. 가장 많이 담은 작가(없으면 최근에 담은 책의 작가) 한 명만, 화면에 보일 때 한 번 찾는다
export function LibraryAuthorBooks({ author, books, searchBooks }: LibraryAuthorBooksProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [result, setResult] = useState<{ author: string; state: AuthorBooksState } | null>(null);
  const callSearchBooks = useEffectEvent((...args: Parameters<SearchBooks>) => searchBooks(...args));
  const pickOtherBooks = useEffectEvent((found: PhotoScanSearchBook[]) => otherBooks(found, author.author, books));

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const controller = new AbortController();
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      setResult({ author: author.author, state: { status: "loading" } });
      void callSearchBooks(author.author, controller.signal).then((response) => {
        if (controller.signal.aborted) return;
        setResult({
          author: author.author,
          state: response.ok ? { books: pickOtherBooks(response.data), status: "ready" } : { status: "failed" },
        });
      });
    }, { rootMargin: "160px" });
    observer.observe(section);
    return () => {
      observer.disconnect();
      controller.abort();
    };
  }, [author.author]);

  const state: AuthorBooksState = result?.author === author.author ? result.state : { status: "idle" };
  // 못 찾았거나 실패하면 줄을 통째로 숨긴다(도서관 화면에서 빈 칸·오류 문구는 소음이다)
  const isHidden = state.status === "failed" || (state.status === "ready" && state.books.length === 0);
  const titleId = "library-author-books-title";

  return (
    <section
      aria-labelledby={isHidden ? undefined : titleId}
      className={isHidden ? "hidden" : "page-content mt-10 border-t border-hairline pt-7"}
      ref={sectionRef}
    >
      <h2 className="break-words type-title" id={titleId}>{author.author}의 다른 책</h2>
      <p className="mt-1 type-caption text-text-secondary">
        {author.count >= 2
          ? `${author.author}의 책을 ${author.count}권 담았어요. 아직 안 담은 책이에요.`
          : `최근에 담은 『${author.latestTitle}』의 작가예요.`}
      </p>
      {state.status === "ready" ? (
        <ul className="mt-4 grid grid-cols-3 gap-3">
          {state.books.map((book) => {
            const content = (
              <>
                <span className="book-lift-cover block rounded-cover">
                  <BookCover alt="" fallbackTitle={book.title} radius="cover" thumbnailUrl={book.coverUrl} />
                </span>
                <span className="mt-2 block line-clamp-2 break-words type-caption font-semibold">{book.title}</span>
                {book.productId === null ? <span className="mt-0.5 block type-caption text-text-tertiary">판매 안 함</span> : null}
              </>
            );
            return (
              <li className="min-w-0" key={book.bookId}>
                {book.productId === null ? content : (
                  <Link
                    className="book-lift block rounded-cover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    to={`/products/${book.productId}`}
                  >
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <div aria-busy="true" className="mt-4 grid grid-cols-3 gap-3" role="status">
          <span className="sr-only">{author.author}의 다른 책을 찾는 중이에요</span>
          {Array.from({ length: MAX_BOOKS }, (_, index) => (
            <span className="aspect-[3/4] animate-pulse rounded-cover bg-muted" key={index} />
          ))}
        </div>
      )}
    </section>
  );
}
