// The National Library of Korea serves a grey "no cover" logo, always 105x140, for some books without a cover.
// The image loads fine (200, real JPEG), so onError never fires and it would be shown as the book's cover.
const BLANK_COVER_WIDTH = 105;
const BLANK_COVER_HEIGHT = 140;
const NL_COVER_URL = /^https?:\/\/(www\.)?nl\.go\.kr\//i;

// Only these covers can be the blank logo; keep them hidden until isBlankCover has checked them.
export function mayBeBlankCover(url: string) {
  return NL_COVER_URL.test(url);
}

export function isBlankCover(url: string, image: HTMLImageElement) {
  return (
    mayBeBlankCover(url) &&
    image.naturalWidth === BLANK_COVER_WIDTH &&
    image.naturalHeight === BLANK_COVER_HEIGHT
  );
}
