import { displayBookTitle } from "@/common/lib/bookTitle";
import { BookCover } from "@/common/components/BookCover";
import type { LibraryMonth } from "@/features/library/lib/libraryShelf";
import type { LibraryBook } from "@/features/library/types/library";

interface LibraryShelfProps {
  isEditing: boolean;
  months: LibraryMonth[];
  onOpen: (book: LibraryBook) => void;
  onToggle: (libraryBookId: number) => void;
  selected: number[];
}

const BOOKS_PER_SHELF = 3;

function shelves(books: LibraryBook[]) {
  const rows: LibraryBook[][] = [];
  for (let start = 0; start < books.length; start += BOOKS_PER_SHELF) {
    rows.push(books.slice(start, start + BOOKS_PER_SHELF));
  }
  return rows;
}

interface ShelfBookProps {
  book: LibraryBook;
  isEditing: boolean;
  isSelected: boolean;
  onOpen: (book: LibraryBook) => void;
  onToggle: (libraryBookId: number) => void;
}

function ShelfBook({ book, isEditing, isSelected, onOpen, onToggle }: ShelfBookProps) {
  const isNotSold = book.productId === null;

  return (
    <button
      aria-label={isEditing ? book.title : [book.title, book.author, isNotSold ? "판매 안 함" : null].filter(Boolean).join(", ")}
      aria-pressed={isEditing ? isSelected : undefined}
      className="book-lift block w-full rounded-cover text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      onClick={() => (isEditing ? onToggle(book.libraryBookId) : onOpen(book))}
      type="button"
    >
      <span className="book-lift-cover relative block rounded-cover">
        <BookCover alt="" fallbackTitle={book.title} radius="cover" thumbnailUrl={book.coverImageUrl} />
        {isNotSold ? (
          // 빨간 글씨는 오류처럼 보여 표지 위 작은 회색 딱지로 둔다
          <span aria-hidden="true" className="absolute bottom-1 left-1 rounded-sm bg-surface/90 px-1 text-[0.625rem] font-semibold leading-4 text-text-secondary">
            판매 안 함
          </span>
        ) : null}
        {isEditing ? (
          <span
            aria-hidden="true"
            className={`absolute inset-0 rounded-cover transition-colors ${isSelected ? "bg-black/25" : "bg-transparent"}`}
          >
            <span
              className={`absolute right-1 top-1 flex size-6 items-center justify-center rounded-full border-2 text-xs ${
                isSelected ? "border-accent bg-accent text-white" : "border-white bg-black/25 text-white"
              }`}
            >
              {isSelected ? "✓" : ""}
            </span>
          </span>
        ) : null}
      </span>
      {/* 선반 두께만큼 띄운다 */}
      <span aria-hidden="true" className="mt-3 block truncate type-caption font-semibold text-text-primary">{displayBookTitle(book.title)}</span>
    </button>
  );
}

// 담은 달로 묶고, 세 권마다 얇은 선반 위에 세운다. 상품 목록과 달리 표지와 제목 한 줄만 둔다(저자·담은 날은 책 시트에)
export function LibraryShelf({ isEditing, months, onOpen, onToggle, selected }: LibraryShelfProps) {
  return months.map((month) => (
    <section aria-labelledby={`library-month-${month.key}`} className="page-content pt-7" key={month.key}>
      <h2 className="flex items-baseline gap-1.5 type-title" id={`library-month-${month.key}`}>
        {month.label}
        <span className="type-caption tabular-nums text-text-tertiary">{month.books.length}권</span>
      </h2>
      <div className="mt-3 space-y-5">
        {shelves(month.books).map((row) => (
          <div className="@container relative" key={row[0].libraryBookId}>
            {/* 선반: 표지 아래 끝에 맞춘다. 표지 너비 = (줄 너비 - 칸 사이 2개) / 3, 높이 = 너비 × 4/3 */}
            <span
              aria-hidden="true"
              className="absolute -inset-x-1 h-1.5 rounded-full bg-border-strong shadow-[0_8px_10px_-8px_rgba(36,33,31,0.5)]"
              style={{ top: "calc((100cqw - 1.5rem) * 4 / 9 - 1px)" }}
            />
            <ul className="relative grid grid-cols-3 gap-x-3">
              {row.map((book) => (
                <li className="min-w-0" key={book.libraryBookId}>
                  <ShelfBook
                    book={book}
                    isEditing={isEditing}
                    isSelected={selected.includes(book.libraryBookId)}
                    onOpen={onOpen}
                    onToggle={onToggle}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  ));
}
