import { useState } from "react";

import { BookIcon } from "@/common/components/AppIcons";

interface BookCoverProps {
  // Empty when adjacent text already names the book.
  alt: string;
  // Shown visually only when the cover is missing or fails to load; alt stays the accessible name.
  fallbackTitle: string;
  thumbnailUrl: string | null;
}

const COVER_FRAME_CLASS_NAME =
  "aspect-[3/4] w-full overflow-hidden rounded-control border border-border bg-muted";

export function BookCover({ alt, fallbackTitle, thumbnailUrl }: BookCoverProps) {
  // Compared with the current URL so a new thumbnailUrl loads again instead of inheriting the previous result.
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const imageUrl = thumbnailUrl?.trim() ?? "";

  if (imageUrl && imageUrl !== failedUrl) {
    return (
      <div className={COVER_FRAME_CLASS_NAME}>
        <img
          alt={alt}
          className={`size-full object-cover ${imageUrl === loadedUrl ? "" : "opacity-0"}`}
          loading="lazy"
          onError={() => setFailedUrl(imageUrl)}
          onLoad={() => setLoadedUrl(imageUrl)}
          src={imageUrl}
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden={alt ? undefined : true}
      aria-label={alt || undefined}
      className={`${COVER_FRAME_CLASS_NAME} flex flex-col items-center justify-end gap-1 p-2 pt-7 text-center text-text-tertiary`}
      role={alt ? "img" : undefined}
    >
      <BookIcon className="size-5 shrink-0" />
      <span
        aria-hidden="true"
        className="line-clamp-2 break-words break-keep type-caption font-medium text-text-secondary"
      >
        {fallbackTitle}
      </span>
    </div>
  );
}
