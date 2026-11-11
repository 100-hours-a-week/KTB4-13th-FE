import { CameraIcon, SearchIcon } from "@/common/components/AppIcons";
import { BookCover } from "@/common/components/BookCover";
import type { LibrarySummary as LibrarySummaryData } from "@/features/library/lib/libraryShelf";
import type { LibraryBook } from "@/features/library/types/library";

interface LibrarySummaryProps {
  // 최근에 담은 책부터
  books: LibraryBook[];
  onPhoto: () => void;
  onSearch: () => void;
  summary: LibrarySummaryData;
}

const ADD_BUTTON_CLASS_NAME =
  "inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-control border border-border bg-surface px-3 type-body-small font-semibold text-text-primary transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

// 나의 도서관 맨 위 카드: 몇 권인지, 최근에 담은 표지, 이번 달·많이 담은 작가, 담는 두 가지 길
export function LibrarySummary({ books, onPhoto, onSearch, summary }: LibrarySummaryProps) {
  // 오래된 책부터 그려 가장 최근에 담은 책이 맨 앞(오른쪽, 가장 크게)에 온다
  const stack = books.slice(0, 3).reverse();
  const notes = [
    summary.thisMonthCount > 0 ? `이번 달 ${summary.thisMonthCount}권 담았어요` : null,
    summary.topAuthor ? `가장 많이 담은 작가 · ${summary.topAuthor.author} ${summary.topAuthor.count}권` : null,
  ].filter((note): note is string => note !== null);

  return (
    <section aria-labelledby="library-summary-title" className="rounded-panel bg-muted px-4 pb-4 pt-4">
      <div className="flex items-center gap-4">
        {/* 최근에 담은 표지 3장을 겹쳐 놓는다 */}
        <div aria-hidden="true" className="flex shrink-0 items-end">
          {stack.map((book, index) => (
            <span
              className={`block rounded-cover shadow-[0_6px_12px_-8px_rgba(36,33,31,0.6)] not-first:-ml-4 ${
                index === stack.length - 1 ? "w-12" : index === stack.length - 2 ? "w-10.5" : "w-9"
              }`}
              key={book.libraryBookId}
            >
              <BookCover alt="" fallbackTitle={book.title} radius="cover" thumbnailUrl={book.coverImageUrl} />
            </span>
          ))}
        </div>
        <div className="min-w-0">
          <h2 className="type-heading tabular-nums" id="library-summary-title">{summary.total}권</h2>
          {notes.map((note) => (
            <p className="truncate type-caption text-text-secondary" key={note}>{note}</p>
          ))}
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button className={ADD_BUTTON_CLASS_NAME} onClick={onPhoto} type="button">
          <CameraIcon aria-hidden="true" className="size-4.5" />
          사진으로 담기
        </button>
        <button className={ADD_BUTTON_CLASS_NAME} onClick={onSearch} type="button">
          <SearchIcon aria-hidden="true" className="size-4.5" />
          제목으로 담기
        </button>
      </div>
      {/* 담은 책은 BE 가 추천 요청에 함께 보내고(가진 책), 취향 프로필은 다음 날 다시 계산한다. "추천에서 빼요"는 약속하지 않는다(다른 판본은 아직 못 뺀다) */}
      <p className="mt-3 type-caption text-text-tertiary">담은 책을 바탕으로 북적이 추천이 달라져요.</p>
    </section>
  );
}
