import { sampleBooks } from "@/features/onboarding/mocks/onboardingMockData";

interface BookPickStepProps {
  onToggleBook: (id: string) => void;
  selectedBookIds: string[];
}

export function BookPickStep({ onToggleBook, selectedBookIds }: BookPickStepProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {sampleBooks.map((book) => {
        const isSelected = selectedBookIds.includes(book.id);

        return (
          <button
            aria-pressed={isSelected}
            className={`flex flex-col gap-1.5 rounded-control border p-1.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              isSelected
                ? "border-accent bg-accent-soft"
                : "border-border bg-surface hover:border-border-strong"
            }`}
            key={book.id}
            onClick={() => onToggleBook(book.id)}
            type="button"
          >
            <span
              aria-hidden="true"
              className="relative flex aspect-[3/4] items-center justify-center rounded-control bg-muted type-caption text-text-tertiary"
            >
              표지
              {isSelected ? (
                <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                  ✓
                </span>
              ) : null}
            </span>
            <span className="type-body-small truncate font-semibold text-text-primary">
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
