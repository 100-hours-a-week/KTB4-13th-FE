import { useState } from "react";

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
  const className =
    "flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-control bg-muted";

  if (book.coverImageUrl && !hasImageError) {
    return (
      <img
        alt={`${book.title} 표지`}
        className={`${className} object-cover`}
        loading="lazy"
        onError={() => setHasImageError(true)}
        src={book.coverImageUrl}
      />
    );
  }

  return (
    <span
      aria-label={`${book.title} 표지 이미지 없음`}
      className={`${className} p-2 text-center type-caption text-text-tertiary`}
      role="img"
    >
      <span aria-hidden="true" className="line-clamp-3">
        {book.title}
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
    <div className="grid grid-cols-3 gap-3">
      {books.map((book) => {
        const isSelected = selectedBookIds.includes(book.bookId);

        return (
          <button
            aria-pressed={isSelected}
            className={`relative flex min-w-0 flex-col gap-1.5 rounded-control border p-1.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              isSelected
                ? "border-accent bg-accent-soft"
                : "border-border bg-surface hover:border-border-strong"
            }`}
            key={book.bookId}
            onClick={() => onToggleBook(book.bookId)}
            type="button"
          >
            <BookCandidateCover book={book} />
            {isSelected ? (
              <span
                aria-hidden="true"
                className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-white"
              >
                ✓
              </span>
            ) : null}
            <span className="line-clamp-2 type-body-small font-semibold text-text-primary">
              {book.title}
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
