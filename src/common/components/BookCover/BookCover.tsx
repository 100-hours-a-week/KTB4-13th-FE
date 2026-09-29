interface BookCoverProps {
  // Empty when adjacent text already names the book.
  alt: string;
  thumbnailUrl: string | null;
}

export function BookCover({ alt, thumbnailUrl }: BookCoverProps) {
  const className =
    "aspect-[3/4] w-full rounded-control border border-border bg-muted";

  if (thumbnailUrl) {
    return (
      <img
        alt={alt}
        className={`${className} object-cover`}
        loading="lazy"
        src={thumbnailUrl}
      />
    );
  }

  return alt ? (
    <div
      aria-label={alt}
      className={`${className} flex items-center justify-center p-2 text-center type-caption text-text-tertiary`}
      role="img"
    >
      <span aria-hidden="true" className="line-clamp-3">
        {alt}
      </span>
    </div>
  ) : (
    <div aria-hidden="true" className={className} />
  );
}
