import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { CameraIcon } from "@/common/components/AppIcons";
import { Button } from "@/common/components/Button";
import { RetryButton } from "@/common/components/RetryButton";
import { libraryApi } from "@/features/library/api/libraryApi";
import { BookSearchSheet } from "@/features/library/components/BookSearchSheet";
import { LibraryAuthorBooks } from "@/features/library/components/LibraryAuthorBooks";
import { LibraryBookSheet } from "@/features/library/components/LibraryBookSheet";
import { LibraryNotice } from "@/features/library/components/LibraryNotice";
import { LibraryShelf } from "@/features/library/components/LibraryShelf";
import { LibrarySummary } from "@/features/library/components/LibrarySummary";
import { PhotoCaptureSheet } from "@/features/library/components/PhotoCaptureSheet";
import { PhotoScanSavedBanner } from "@/features/library/components/PhotoScanSavedBanner";
import { rememberLibraryBooks } from "@/features/library/lib/libraryIndex";
import { groupByAddedMonth, pickFeaturedAuthor, summarizeLibrary } from "@/features/library/lib/libraryShelf";
import { hasFinalConsonant } from "@/features/library/lib/similarBooksAsk";
import type { LibraryApi, LibraryBook } from "@/features/library/types/library";
import type { LibraryLocationState, LibraryPhotoLocationState, PhotoScanSearchBook } from "@/features/library/types/photoScan";
import { AppPageHeader } from "@/features/navigation/components/AppPageHeader";

type Notice =
  | { id: number; kind: "removed"; books: LibraryBook[] }
  | { id: number; kind: "done" | "error"; message: string };

// 뺀 뒤 되돌리기를 누를 시간(Material 스낵바 권장 4~10초)
const REMOVED_NOTICE_MS = 8000;
const NOTICE_MS = 3500;

interface LibraryPageProps {
  // 개발용 미리보기는 가짜 API 를 넘긴다
  api?: LibraryApi;
}

export function LibraryPage({ api = libraryApi }: LibraryPageProps) {
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [requestKey, setRequestKey] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [sheetBook, setSheetBook] = useState<LibraryBook | null>(null);
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [addingIds, setAddingIds] = useState<number[]>([]);
  const [notice, setNotice] = useState<Notice | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  // 사진으로 담고 돌아왔을 때만 있다. 책을 빼거나 더 담으면 맞지 않는 말이 되어 지운다
  const [savedBanner, setSavedBanner] = useState(
    () => (location.state as LibraryLocationState | null)?.photoScanSaved ?? null,
  );

  // 새로 고침·뒤로 가기로 같은 배너가 다시 뜨지 않게 기록의 state 를 비운다
  useEffect(() => {
    if (location.state) navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    const controller = new AbortController();
    void api.fetchBooks(controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      if (result.ok) {
        setBooks(result.data);
        rememberLibraryBooks(result.data);
        setStatus("ready");
      } else {
        setStatus("error");
      }
    });
    return () => controller.abort();
  }, [api, requestKey]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(
      () => setNotice((current) => (current?.id === notice.id ? null : current)),
      notice.kind === "removed" ? REMOVED_NOTICE_MS : NOTICE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [notice]);

  const months = useMemo(() => groupByAddedMonth(books), [books]);
  const summary = useMemo(() => summarizeLibrary(books), [books]);
  const featuredAuthor = useMemo(() => pickFeaturedAuthor(books), [books]);
  const ownedBookIds = useMemo(() => new Set(books.map((book) => book.bookId)), [books]);

  const applyBooks = (next: LibraryBook[]) => {
    setBooks(next);
    rememberLibraryBooks(next);
  };

  // 담기·되돌리기 뒤에 목록을 다시 받는다(새 libraryBookId·담은 시각은 BE 만 안다). 화면은 그대로 둔다
  const reloadQuietly = async () => {
    const result = await api.fetchBooks(new AbortController().signal);
    if (result.ok) applyBooks(result.data);
    return result.ok;
  };

  const showNotice = (next: Omit<Extract<Notice, { kind: "done" | "error" }>, "id">) => setNotice({ ...next, id: Date.now() });

  const openPhotoScan = (photo: File) => {
    const state: LibraryPhotoLocationState = { photo };
    navigate("/my/library/photo", { state });
  };

  const toggle = (libraryBookId: number) => {
    setSelected((ids) =>
      ids.includes(libraryBookId)
        ? ids.filter((id) => id !== libraryBookId)
        : [...ids, libraryBookId],
    );
  };

  const startEditing = () => {
    setNotice(null);
    setIsEditing(true);
  };

  const finishEditing = () => {
    setIsEditing(false);
    setSelected([]);
  };

  // 확인 창 대신 바로 빼고 되돌리기를 준다. 다시 담으면 같은 libraryBookId 가 되살아난다(11/11 dev 확인)
  const removeBooks = async (targets: LibraryBook[]) => {
    if (isRemoving || targets.length === 0) return;
    setIsRemoving(true);
    const result = await api.deleteBooks(targets.map((book) => book.libraryBookId));
    setIsRemoving(false);
    if (!result.ok) {
      showNotice({ kind: "error", message: "책을 빼지 못했어요. 다시 시도해 주세요." });
      return;
    }
    const removedIds = new Set(targets.map((book) => book.libraryBookId));
    applyBooks(books.filter((book) => !removedIds.has(book.libraryBookId)));
    setSavedBanner(null);
    setSheetBook(null);
    finishEditing();
    setNotice({ books: targets, id: Date.now(), kind: "removed" });
  };

  const restoreBooks = async (removed: LibraryBook[]) => {
    if (isRestoring) return;
    setIsRestoring(true);
    const result = await api.addBooks(removed.map((book) => book.bookId));
    if (!result.ok) {
      setIsRestoring(false);
      showNotice({ kind: "error", message: "되돌리지 못했어요. 다시 시도해 주세요." });
      return;
    }
    // 다시 받지 못하면 뺐던 그대로 되돌려 놓는다
    if (!(await reloadQuietly())) {
      applyBooks([...books, ...removed].sort((a, b) => b.addedAt.localeCompare(a.addedAt)));
    }
    setIsRestoring(false);
    showNotice({ kind: "done", message: `${removed.length}권을 되돌렸어요` });
  };

  const addFromSearch = async (book: PhotoScanSearchBook) => {
    setAddingIds((ids) => [...ids, book.bookId]);
    const result = await api.addBooks([book.bookId]);
    if (result.ok) {
      await reloadQuietly();
      setSavedBanner(null);
    } else {
      showNotice({ kind: "error", message: "책을 담지 못했어요. 다시 시도해 주세요." });
    }
    setAddingIds((ids) => ids.filter((id) => id !== book.bookId));
  };

  const hasBooks = status === "ready" && books.length > 0;
  const isAllSelected = hasBooks && selected.length === books.length;

  return (
    <div className="relative flex h-full flex-col bg-surface">
      <AppPageHeader
        action={
          hasBooks ? (
            <button
              className="min-h-11 text-right type-body-small font-semibold"
              onClick={() => (isEditing ? finishEditing() : startEditing())}
              type="button"
            >
              {isEditing ? "완료" : "편집"}
            </button>
          ) : null
        }
        fallbackPath="/my"
        title="나의 도서관"
      />
      <main className="min-h-0 flex-1 overflow-y-auto pb-28">
        {status === "loading" ? (
          <div aria-busy="true" className="page-content pt-4" role="status">
            <span className="sr-only">도서관을 불러오는 중이에요</span>
            <div className="h-40 animate-pulse rounded-panel bg-muted" />
            <div className="mt-8 grid grid-cols-3 gap-3">
              {Array.from({ length: 6 }, (_, index) => (
                <span className="aspect-[3/4] animate-pulse rounded-cover bg-muted" key={index} />
              ))}
            </div>
          </div>
        ) : null}
        {status === "error" ? (
          <section className="page-content flex min-h-64 flex-col items-center justify-center text-center">
            <h2 className="type-title">도서관을 불러오지 못했어요</h2>
            <p className="mt-2 type-body-small text-text-tertiary">잠시 후 다시 시도해 주세요.</p>
            <div className="mt-4">
              <RetryButton onClick={() => { setStatus("loading"); setRequestKey((value) => value + 1); }} />
            </div>
          </section>
        ) : null}
        {hasBooks ? (
          <>
            {isEditing ? (
              <div className="page-content flex min-h-14 items-center justify-between gap-3 pt-2">
                <p aria-live="polite" className="type-body-small text-text-secondary">
                  {selected.length > 0 ? `${selected.length}권 골랐어요` : "뺄 책을 골라 주세요"}
                </p>
                <button
                  className="min-h-11 type-body-small font-semibold text-text-primary"
                  onClick={() => setSelected(isAllSelected ? [] : books.map((book) => book.libraryBookId))}
                  type="button"
                >
                  {isAllSelected ? "모두 해제" : "모두 고르기"}
                </button>
              </div>
            ) : (
              <div className="page-content pt-4">
                <LibrarySummary
                  books={books}
                  onPhoto={() => setIsCaptureOpen(true)}
                  onSearch={() => setIsSearchOpen(true)}
                  summary={summary}
                />
                {savedBanner ? (
                  <div className="mt-3">
                    <PhotoScanSavedBanner {...savedBanner} />
                  </div>
                ) : null}
              </div>
            )}
            <LibraryShelf
              isEditing={isEditing}
              months={months}
              onOpen={setSheetBook}
              onToggle={toggle}
              selected={selected}
            />
            {!isEditing && featuredAuthor ? (
              <LibraryAuthorBooks author={featuredAuthor} books={books} key={featuredAuthor.author} searchBooks={api.searchBooks} />
            ) : null}
          </>
        ) : null}
        {status === "ready" && books.length === 0 ? (
          <section className="page-content flex min-h-96 flex-col items-center justify-center text-center">
            <span className="inline-flex size-18 items-center justify-center rounded-full bg-muted text-primary">
              <CameraIcon aria-hidden="true" className="size-8" />
            </span>
            <h2 className="mt-4 type-title">나의 책장을 채워 보세요</h2>
            <p className="mt-2 type-body-small text-text-tertiary">가진 책이나 읽은 책을 담으면 북적이가 취향을 더 잘 알아요.</p>
            <div className="mt-5 flex w-full max-w-xs flex-col gap-2">
              <Button onClick={() => setIsCaptureOpen(true)}>사진으로 담기</Button>
              <Button onClick={() => setIsSearchOpen(true)} variant="secondary">제목으로 담기</Button>
            </div>
            <Link className="mt-3 inline-flex min-h-11 items-center type-body-small font-semibold text-text-secondary underline underline-offset-4" to="/recommendations/chat">
              북적이에게 추천받기
            </Link>
          </section>
        ) : null}
      </main>
      {isEditing ? (
        <div className="page-content absolute inset-x-0 bottom-0 z-20 border-t border-hairline bg-surface pb-5 pt-3">
          <Button
            className="w-full"
            disabled={selected.length === 0}
            isLoading={isRemoving}
            onClick={() => { void removeBooks(books.filter((book) => selected.includes(book.libraryBookId))); }}
          >
            선택한 책 빼기{selected.length ? ` (${selected.length})` : ""}
          </Button>
        </div>
      ) : null}
      {notice && !isEditing ? (
        <div className="page-content pointer-events-none absolute inset-x-0 bottom-0 z-30 pb-4">
          {notice.kind === "removed" ? (
            <LibraryNotice
              action={{ isBusy: isRestoring, label: "되돌리기", onClick: () => { void restoreBooks(notice.books); } }}
            >
              {notice.books.length === 1
                ? `『${notice.books[0].title}』${hasFinalConsonant(notice.books[0].title) ? "을" : "를"} 뺐어요`
                : `${notice.books.length}권을 뺐어요`}
            </LibraryNotice>
          ) : (
            <LibraryNotice>{notice.message}</LibraryNotice>
          )}
        </div>
      ) : null}
      <PhotoCaptureSheet isOpen={isCaptureOpen} onClose={() => setIsCaptureOpen(false)} onPick={openPhotoScan} />
      {isSearchOpen ? (
        <BookSearchSheet
          hint="가진 책이나 읽은 책을 찾아 담아 주세요."
          initialQuery=""
          onClose={() => setIsSearchOpen(false)}
          onPick={(book) => { void addFromSearch(book); }}
          pickLabel="담기"
          pickState={(book) => (ownedBookIds.has(book.bookId) ? "done" : addingIds.includes(book.bookId) ? "busy" : "idle")}
          searchBooks={api.searchBooks}
          title="제목으로 담기"
        />
      ) : null}
      <LibraryBookSheet book={sheetBook} onClose={() => setSheetBook(null)} onRemove={(book) => { void removeBooks([book]); }} />
    </div>
  );
}
