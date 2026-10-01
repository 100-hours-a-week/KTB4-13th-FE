interface HomeSectionHeaderProps {
  id: string;
  // Omitted when the section has no list to expand, e.g. for guests.
  onMoreClick?: () => void;
  title: string;
}

export function HomeSectionHeader({ id, onMoreClick, title }: HomeSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="type-subheading text-text-primary" id={id}>
        {title}
      </h2>
      {onMoreClick ? (
        <button
          className="-mr-1 inline-flex min-h-11 items-center px-1 type-body-small font-medium text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
