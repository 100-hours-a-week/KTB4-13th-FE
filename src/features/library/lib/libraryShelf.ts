import { normalizeAuthor } from "@/common/lib/authorName";
import type { LibraryBook } from "@/features/library/types/library";

export interface LibraryMonth {
  books: LibraryBook[];
  // "2026-11"
  key: string;
  label: string;
}

export interface LibraryAuthor {
  // 화면에 보이는 이름(그 작가 책 중 가장 최근에 담은 책의 표기)
  author: string;
  count: number;
  // 그 작가 책 중 가장 최근에 담은 책
  latestTitle: string;
}

export interface LibrarySummary {
  // 같은 이름으로 2권 이상 담은 작가가 없으면 null
  topAuthor: LibraryAuthor | null;
  thisMonthCount: number;
  total: number;
}

// addedAt 은 시간대 없는 "2026-11-11T15:03:22" 라 앞 글자로 연·월·일을 바로 읽는다
function yearMonthOf(addedAt: string) {
  return addedAt.slice(0, 7);
}

function currentYearMonth(now: Date) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// 담은 달로 묶는다. 책은 BE 가 준 순서(최근에 담은 책 먼저)를 그대로 둔다
export function groupByAddedMonth(books: LibraryBook[], now = new Date()): LibraryMonth[] {
  const months = new Map<string, LibraryBook[]>();
  for (const book of books) {
    const key = yearMonthOf(book.addedAt);
    months.set(key, [...(months.get(key) ?? []), book]);
  }
  const thisYear = String(now.getFullYear());

  return [...months].map(([key, monthBooks]) => {
    const [year, month] = key.split("-");
    const monthLabel = `${Number(month)}월`;
    return { books: monthBooks, key, label: year === thisYear ? monthLabel : `${year}년 ${monthLabel}` };
  });
}

// 가장 많이 담은 작가. 권수가 같으면 더 최근에 담은 작가를 고른다(books 가 최근 순이라 먼저 나온 쪽)
function authorsByCount(books: LibraryBook[]) {
  const authors = new Map<string, LibraryAuthor>();
  for (const book of books) {
    const name = book.author.trim();
    if (!name) continue;
    const key = normalizeAuthor(name);
    const current = authors.get(key);
    authors.set(key, current ? { ...current, count: current.count + 1 } : { author: name, count: 1, latestTitle: book.title });
  }
  // Map 은 처음 넣은 순서를 지키고 sort 는 안정 정렬이라, 권수가 같으면 최근에 담은 작가가 앞에 남는다
  return [...authors.values()].sort((a, b) => b.count - a.count);
}

export function summarizeLibrary(books: LibraryBook[], now = new Date()): LibrarySummary {
  const thisMonth = currentYearMonth(now);
  const [top] = authorsByCount(books);

  return {
    thisMonthCount: books.filter((book) => yearMonthOf(book.addedAt) === thisMonth).length,
    topAuthor: top && top.count >= 2 ? top : null,
    total: books.length,
  };
}

// 도서관 아래 "작가의 다른 책" 줄에 쓸 작가. 2권 이상 담은 작가가 없으면 가장 최근에 담은 책의 작가
export function pickFeaturedAuthor(books: LibraryBook[]): LibraryAuthor | null {
  return authorsByCount(books)[0] ?? null;
}

// "11월 11일에 담았어요"
export function addedDateLabel(addedAt: string, now = new Date()) {
  const [year, month, day] = addedAt.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = year === now.getFullYear() ? `${month}월 ${day}일` : `${year}년 ${month}월 ${day}일`;
  return `${date}에 담았어요`;
}
