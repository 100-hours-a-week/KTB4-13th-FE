import { useState } from "react";

import { displayBookTitle } from "@/common/lib/bookTitle";
import { isBlankCover, mayBeBlankCover } from "@/common/lib/blankCover";
import type { BookCandidate } from "@/features/onboarding/types/onboarding";

interface BookPickStepProps {
  books: BookCandidate[];
  onToggleBook: (id: number) => void;
  selectedBookIds: number[];
}

interface BookCandidateCoverProps {
  book: BookCandidate;
}

function BookCandidateCover({ book }: BookCandidateCoverProps) {
  const [hasImageError, setHasImageError] = useState(false);
  // A cover that may be the library's blank logo stays invisible until it has loaded and been checked.
  const [isImageChecked, setIsImageChecked] = useState(false);
  const className =
    "flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-cover border border-border bg-muted";

  if (book.coverImageUrl && !hasImageError) {
    const imageUrl = book.coverImageUrl;
    const isUnchecked = mayBeBlankCover(imageUrl) && !isImageChecked;

    return (
      <img
        alt={`${displayBookTitle(book.title)} 표지`}
        className={`${className} object-cover ${isUnchecked ? "opacity-0" : ""}`}
        loading="lazy"
        onError={() => setHasImageError(true)}
        onLoad={(event) => {
          if (!mayBeBlankCover(imageUrl)) return;
          if (isBlankCover(imageUrl, event.currentTarget)) {
            setHasImageError(true);
          } else {
            setIsImageChecked(true);
          }
        }}
        src={imageUrl}
      />
    );
  }

  return (
    <span
      aria-label={`${displayBookTitle(book.title)} 표지 이미지 없음`}
      className={`${className} p-2 text-center type-caption text-text-tertiary`}
      role="img"
    >
      <span aria-hidden="true" className="line-clamp-3">
        {displayBookTitle(book.title)}
      </span>
    </span>
  );
}

export function BookPickStep({
  books,
  onToggleBook,
  selectedBookIds,
}: BookPickStepProps) {
  return (
    <div className="grid grid-cols-3 gap-x-3 gap-y-6">
      {books.map((book) => {
        const isSelected = selectedBookIds.includes(book.bookId);

        return (
          <button
            aria-pressed={isSelected}
            className="group relative flex min-w-0 flex-col gap-1.5 rounded-cover text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            key={book.bookId}
            onClick={() => onToggleBook(book.bookId)}
            type="button"
          >
            <span
              className={`block rounded-cover transition-shadow ${
                isSelected
                  ? "ring-2 ring-text-primary ring-offset-2"
                  : "group-hover:ring-1 group-hover:ring-border-strong group-hover:ring-offset-2"
              }`}
            >
              <BookCandidateCover book={book} />
            </span>
            {isSelected ? (
              <span
                aria-hidden="true"
                className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-text-primary text-xs font-bold text-white"
              >
                ✓
              </span>
            ) : null}
            <span className="line-clamp-2 type-body-small font-semibold text-text-primary">
              {displayBookTitle(book.title)}
            </span>
            <span className="type-caption truncate text-text-tertiary">
              {book.author}
            </span>
          </button>
        );
      })}
    </div>
  );
}
