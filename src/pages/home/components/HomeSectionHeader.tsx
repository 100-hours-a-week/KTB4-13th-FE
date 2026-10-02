interface HomeSectionHeaderProps {
  id: string;
  // Omitted when the section has no list to expand, e.g. for guests.
  onMoreClick?: () => void;
  title: string;
}

export function HomeSectionHeader({ id, onMoreClick, title }: HomeSectionHeaderProps) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="type-section text-text-primary" id={id}>
        {title}
      </h2>
      {onMoreClick ? (
        <button
          className="-mr-1 inline-flex min-h-11 shrink-0 items-center px-1 type-caption font-medium text-text-tertiary underline-offset-4 transition-colors hover:text-text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={onMoreClick}
          type="button"
        >
          더보기
          <span className="sr-only"> {title}</span>
        </button>
      ) : null}
    </div>
  );
}
