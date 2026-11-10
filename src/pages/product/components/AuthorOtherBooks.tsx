import { Link } from "react-router-dom";

import { BookCover } from "@/common/components/BookCover";
import { useCoverLinkClick } from "@/common/lib/coverTransition";
import type { BookSearchItem } from "@/features/search/types/bookSearch";

export function AuthorOtherBooks({ author, books }: { author: string; books: BookSearchItem[] }) {
  const onCoverLinkClick = useCoverLinkClick();

  return (
    <section aria-labelledby="product-author-books" className="border-b border-hairline py-6">
      <h2 className="scroll-mt-16 type-title" id="product-author-books" tabIndex={-1}>저자의 다른 책</h2>
      <p className="mt-1 break-words type-body-small text-text-secondary">{author}</p>
      <ul className="mt-4 grid grid-cols-3 gap-3">
        {books.map(({ bookId, productId, title, coverUrl }) => {
          const content = (
            <>
              <BookCover alt="" fallbackTitle={title} radius="cover" thumbnailUrl={coverUrl} />
              <span className="mt-2 block line-clamp-2 break-words type-body-small font-semibold">{title}</span>
            </>
          );
          return (
            <li className="min-w-0" key={bookId}>
              {productId === null ? content : (
                <Link
                  className="block rounded-cover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
