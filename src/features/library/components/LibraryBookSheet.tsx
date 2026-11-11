import { Link } from "react-router-dom";

import { displayBookTitle } from "@/common/lib/bookTitle";
import { BookCover } from "@/common/components/BookCover";
import { LibrarySheet } from "@/features/library/components/LibrarySheet";
import { SimilarBooksLink } from "@/features/library/components/SimilarBooksLink";
import { addedDateLabel } from "@/features/library/lib/libraryShelf";
import type { LibraryBook } from "@/features/library/types/library";

interface LibraryBookSheetProps {
  book: LibraryBook | null;
  onClose: () => void;
  onRemove: (book: LibraryBook) => void;
}

const ACTION_CLASS_NAME =
  "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-control px-4 type-body-small font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

// 도서관에서 책을 누르면 여는 시트. 책을 다시 찾아보고, 비슷한 책으로 넘어가고, 도서관에서 뺀다
export function LibraryBookSheet({ book, onClose, onRemove }: LibraryBookSheetProps) {
  return (
    <LibrarySheet isOpen={book !== null} onClose={onClose} title="담아둔 책">
      {book ? (
        <div className="pb-2">
          <div className="flex items-start gap-4 pt-1">
            <span className="w-20 shrink-0 rounded-cover shadow-[0_10px_18px_-12px_rgba(36,33,31,0.6)]">
              <BookCover alt="" fallbackTitle={book.title} radius="cover" thumbnailUrl={book.coverImageUrl} />
            </span>
            <div className="min-w-0 pt-1">
              <p className="break-words break-keep type-title">{displayBookTitle(book.title)}</p>
              <p className="mt-1 break-words type-body-small text-text-secondary">{book.author}</p>
              <p className="mt-2 type-caption text-text-tertiary">{addedDateLabel(book.addedAt)}</p>
              {book.productId === null ? (
                <p className="mt-1 type-caption text-text-tertiary">지금은 북적북적에서 팔지 않는 책이에요</p>
              ) : null}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            {/* 팔지 않는 책도 여기서 다음 책으로 갈 수 있다 */}
            <SimilarBooksLink className={`${ACTION_CLASS_NAME} bg-primary text-white hover:bg-primary-hover`} title={book.title}>
              이 책과 비슷한 책 추천받기
            </SimilarBooksLink>
            {book.productId !== null ? (
              <Link className={`${ACTION_CLASS_NAME} border border-border bg-surface text-text-primary hover:bg-neutral-50`} to={`/products/${book.productId}`}>
                책 정보 보기
              </Link>
            ) : null}
            <button className={`${ACTION_CLASS_NAME} text-error`} onClick={() => onRemove(book)} type="button">
              나의 도서관에서 빼기
            </button>
          </div>
        </div>
      ) : null}
    </LibrarySheet>
  );
}
