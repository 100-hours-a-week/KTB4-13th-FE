import { useState } from "react";

interface BookCoverProps {
  // Empty when adjacent text already names the book.
  alt: string;
  // Shown visually only when the cover is missing or fails to load; alt stays the accessible name.
  fallbackTitle: string;
  thumbnailUrl: string | null;
}

const COVER_FRAME_CLASS_NAME =
  "aspect-[3/4] w-full overflow-hidden rounded-control border border-border bg-muted";

const FALLBACK_COVER_TONES = [
  { cover: "bg-muted text-text-primary", publisher: "text-text-tertiary", spine: "bg-border-strong" },
  { cover: "bg-border text-text-primary", publisher: "text-text-secondary", spine: "bg-text-disabled" },
  { cover: "bg-accent-soft text-text-primary", publisher: "text-text-tertiary", spine: "bg-accent/40" },
  { cover: "bg-primary text-white", publisher: "text-white/60", spine: "bg-white/15" },
];

function getFallbackCoverTone(title: string) {
  let titleHash = 0;

  for (let index = 0; index < title.length; index += 1) {
    titleHash = (titleHash * 31 + title.charCodeAt(index)) >>> 0;
  }

  return FALLBACK_COVER_TONES[titleHash % FALLBACK_COVER_TONES.length];
}

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

  const fallbackTone = getFallbackCoverTone(fallbackTitle);

  return (
    <div
      aria-hidden={alt ? undefined : true}
      aria-label={alt || undefined}
      className={`@container relative aspect-[3/4] w-full overflow-hidden rounded-control border border-border ${fallbackTone.cover}`}
      role={alt ? "img" : undefined}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-1.5 ${fallbackTone.spine}`}
      />
      <span
        aria-hidden="true"
        className="flex h-full flex-col justify-between pb-2 pl-4 pr-2.5 pt-4"
      >
        <span className="line-clamp-3 break-words break-keep type-caption font-semibold leading-snug">
          {fallbackTitle}
        </span>
        <span
          className={`hidden self-end text-[0.625rem] tracking-wide @[6rem]:block ${fallbackTone.publisher}`}
        >
          북적북적
        </span>
      </span>
    </div>
  );
}
