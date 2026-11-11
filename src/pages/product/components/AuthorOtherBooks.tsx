import { Link } from "react-router-dom";

import { BookCover } from "@/common/components/BookCover";
import { RetryButton } from "@/common/components/RetryButton";
import { useCoverLinkClick } from "@/common/lib/coverTransition";
import type { BookSearchItem } from "@/features/search/types/bookSearch";

interface AuthorOtherBooksProps {
  author: string;
  books: BookSearchItem[];
  onRetry: () => void;
  status: "idle" | "loading" | "ready" | "error";
}

export function AuthorOtherBooks({ author, books, onRetry, status }: AuthorOtherBooksProps) {
  const onCoverLinkClick = useCoverLinkClick();

  return (
    <section aria-labelledby="product-author-books" className="border-b border-hairline py-6">
      <h2 className="scroll-mt-16 type-title" id="product-author-books" tabIndex={-1}>저자의 다른 책</h2>
      <p className="mt-1 break-words type-body-small text-text-secondary">{author}</p>
      {status === "idle" || status === "loading" ? (
        <p aria-busy="true" className="mt-4 type-body-small text-text-tertiary" role="status">저자의 다른 책을 불러오는 중이에요</p>
      ) : status === "error" ? (
        <div className="mt-4 flex items-center justify-between gap-3 type-body-small text-text-secondary" role="status">
          저자의 다른 책을 불러오지 못했어요
          <RetryButton onClick={onRetry} />
        </div>
      ) : books.length === 0 ? (
        <p className="mt-4 type-body-small text-text-tertiary">같은 저자의 다른 책을 찾지 못했어요</p>
      ) : null}
      <ul className="mt-4 grid grid-cols-3 gap-3">
        {books.map(({ bookId, productId, title, coverUrl }) => {
          const content = (
            <>
              <div className="book-lift-cover rounded-cover">
                <BookCover alt="" fallbackTitle={title} radius="cover" thumbnailUrl={coverUrl} />
              </div>
              <span className="mt-2 block line-clamp-2 break-words type-body-small font-semibold">{title}</span>
            </>
          );
          return (
            <li className="min-w-0" key={bookId}>
              {productId === null ? content : (
                <Link
                  className="book-lift block rounded-cover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  onClick={(event) => onCoverLinkClick(event, `/products/${productId}`, { thumbnailUrl: coverUrl, title })}
                  to={`/products/${productId}`}
                >
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
