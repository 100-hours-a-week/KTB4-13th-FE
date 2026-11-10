import type { BookSearchItem } from "@/features/search/types/bookSearch";

const MAX_AUTHOR_BOOKS = 6;

// "히가시노 게이고, 양윤옥" -> "히가시노 게이고": the first name is the writer, the rest are often translators.
export function primaryAuthor(author: string | null | undefined) {
  const first = author?.split(/[,·]/)[0]?.replace(/\((지은이|지음|글|저)\)|\s(지음|글|저)$/g, "").trim();

  return first && first.length >= 2 ? first : null;
}

// Two keys per title so "달까지 가자(특별판)" and "(히가시노 게이고의) 무한도전" both meet their plain edition.
function titleKeys(title: string) {
  const withoutBracketed = title.replace(/\([^)]*\)|\[[^\]]*\]/g, "").replace(/\s+/g, "");
  const withoutBrackets = title.replace(/[()[\]]/g, "").replace(/\s+/g, "");

  return [withoutBracketed, withoutBrackets];
}

// "(주)창비" = "창비", "다산책방 :다산북스" = "다산책방(다산북스)" = "다산책방".
function publisherKey(publisher: string | null) {
  return (publisher ?? "")
    .replace(/\(주\)|주식회사/g, "")
    .replace(/\([^)]*\)|:.*$/g, "")
    .replace(/[\s#]+/g, "");
}

// A short Korean name ("문병우") is shared by many writers; a longer or foreign one ("히가시노 게이고") rarely is.
function isCommonName(name: string) {
  return /^[가-힣]{2,4}$/.test(name);
}

/*
 * Books whose first author is exactly this name, one per title (editions collapse), current book excluded.
 * The search has no author id. For a short Korean name, dev showed a namesake's farming manuals under an
 * essayist, so only books from the same publisher count; other names keep every publisher, same one first.
 */
export function pickAuthorBooks(
  items: BookSearchItem[],
  author: string,
  current: { productId: number; publisher: string | null; title: string },
) {
  const seen = new Set(titleKeys(current.title));
  const picked: (BookSearchItem & { productId: number })[] = [];

  for (const item of items) {
    if (item.productId === null || item.productId === current.productId) continue;
    if (primaryAuthor(item.author) !== author) continue;
    if (isCommonName(author) && publisherKey(item.publisher) !== publisherKey(current.publisher)) continue;
    const keys = titleKeys(item.title);
    if (keys.some((key) => seen.has(key))) continue;
    keys.forEach((key) => seen.add(key));
    picked.push({ ...item, productId: item.productId });
  }

  const currentPublisher = publisherKey(current.publisher);
  picked.sort(
    (a, b) =>
      Number(publisherKey(b.publisher) === currentPublisher) - Number(publisherKey(a.publisher) === currentPublisher),
  );

  return picked.slice(0, MAX_AUTHOR_BOOKS);
}
