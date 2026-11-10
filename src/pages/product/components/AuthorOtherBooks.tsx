import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { BookCover } from "@/common/components/BookCover";
import { fetchBookSearchResults } from "@/features/search/api/bookSearchApi";
import type { BookSearchItem } from "@/features/search/types/bookSearch";
import { pickAuthorBooks, primaryAuthor } from "@/pages/product/lib/authorBooks";

const SEARCH_SIZE = 20;

// Keeps the detail page from ending at the reviews: the same writer's other books, from the search API.
export function AuthorOtherBooks({
  author,
  productId,
  publisher,
  title,
}: {
  author: string;
  productId: number;
  publisher: string;
  title: string;
}) {
  const name = primaryAuthor(author);
  const [result, setResult] = useState<{ key: string; books: (BookSearchItem & { productId: number })[] } | null>(null);
  const requestKey = `${productId}:${name}`;

  useEffect(() => {
    if (!name) return undefined;
    const controller = new AbortController();

    void fetchBookSearchResults(
      {
        cursor: null,
        priceMax: null,
        priceMin: null,
        pubYearFrom: null,
        pubYearTo: null,
        query: name,
        size: SEARCH_SIZE,
        sort: "popular",
      },
      controller.signal,
    ).then((response) => {
      if (controller.signal.aborted) return;
      setResult({
        key: `${productId}:${name}`,
        books: response.ok ? pickAuthorBooks(response.data.items, name, { productId, publisher, title }) : [],
      });
    });

    return () => controller.abort();
  }, [name, productId, publisher, title]);

  const books = result?.key === requestKey ? result.books : [];
  // One other book reads as a coincidence; show the row only when there is a small shelf.
  if (!name || books.length < 2) return null;

  return (
    <section aria-labelledby="author-other-books-title" className="border-b border-hairline py-7">
      <h2 className="type-title text-text-primary" id="author-other-books-title">
        {name}의 다른 책
      </h2>
      <ul className="-mx-5 mt-4 flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
        {books.map((book) => (
          <li className="w-24 shrink-0" key={book.productId}>
            <Link
              aria-label={`${book.title} 상세 보기`}
              className="block rounded-cover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              to={`/products/${book.productId}`}
            >
              <BookCover alt="" fallbackTitle={book.title} radius="cover" thumbnailUrl={book.coverUrl} />
              <p className="mt-2 line-clamp-2 break-keep type-caption font-semibold text-text-primary">{book.title}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
