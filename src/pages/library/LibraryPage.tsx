import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { BookCover } from "@/common/components/BookCover";
import { Button } from "@/common/components/Button";
import { ConfirmDialog } from "@/common/components/ConfirmDialog/ConfirmDialog";
import { RetryButton } from "@/common/components/RetryButton";
import { Toast } from "@/common/components/Toast";
import {
  deleteLibraryBooks,
  fetchLibraryBooks,
} from "@/features/library/api/libraryApi";
import type { LibraryBook } from "@/features/library/types/library";
import { AppPageHeader } from "@/features/navigation/components/AppPageHeader";

export function LibraryPage() {
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [requestKey, setRequestKey] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void fetchLibraryBooks(controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      if (result.ok) {
        setBooks(result.data);
        setStatus("ready");
      } else {
        setStatus("error");
      }
    });
    return () => controller.abort();
  }, [requestKey]);

  const toggle = (libraryBookId: number) => {
    setSelected((ids) =>
      ids.includes(libraryBookId)
        ? ids.filter((id) => id !== libraryBookId)
        : [...ids, libraryBookId],
    );
  };

  const finishEditing = () => {
    setIsEditing(false);
    setSelected([]);
  };

  const handleDelete = async () => {
    if (isDeleting || selected.length === 0) return;
    setIsDeleting(true);
    setDeleteError(null);
    const result = await deleteLibraryBooks(selected);
    setIsDeleting(false);
    setIsConfirming(false);
    if (!result.ok) {
      setDeleteError("선택한 책을 삭제하지 못했어요. 다시 시도해 주세요.");
      return;
    }
    setBooks((current) =>
      current.filter((book) => !selected.includes(book.libraryBookId)),
    );
    finishEditing();
  };

  return (
    <div className="relative flex h-dvh flex-col bg-surface">
      <AppPageHeader
        action={
          status === "ready" && books.length > 0 ? (
            <button
              className="min-h-11 text-right type-body-small font-semibold"
              onClick={() => (isEditing ? finishEditing() : setIsEditing(true))}
              type="button"
            >
              {isEditing ? "완료" : "편집"}
            </button>
          ) : null
        }
        fallbackPath="/my"
        title="나의 도서관"
      />
      <main className="min-h-0 flex-1 overflow-y-auto pb-24">
        <div className="page-content flex min-h-14 items-center">
          <strong className="type-body">
            담아둔 책 {status === "ready" ? books.length : ""}
          </strong>
        </div>
        {deleteError ? (
          <div className="page-content pb-4">
            <Toast variant="error">{deleteError}</Toast>
          </div>
        ) : null}
        {status === "loading" ? (
          <div aria-busy="true" className="page-content grid grid-cols-3 gap-3" role="status">
            <span className="sr-only">도서관을 불러오는 중이에요</span>
            {Array.from({ length: 6 }, (_, index) => (
              <span className="aspect-[2/3] animate-pulse rounded-cover bg-muted" key={index} />
            ))}
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
        {status === "ready" && books.length > 0 ? (
          <ul className="page-content grid grid-cols-3 gap-x-3 gap-y-6">
            {books.map((book) => (
              <li className="relative" key={book.libraryBookId}>
                {isEditing ? (
                  <button
                    aria-label={`${book.title} ${selected.includes(book.libraryBookId) ? "선택 해제" : "선택"}`}
                    className="absolute inset-0 z-10 rounded-cover focus-visible:outline-2 focus-visible:outline-primary"
                    onClick={() => toggle(book.libraryBookId)}
                    type="button"
                  >
                    <span className={`absolute right-1 top-1 flex size-6 items-center justify-center rounded-full border-2 text-xs ${selected.includes(book.libraryBookId) ? "border-accent bg-accent text-white" : "border-white bg-black/25 text-white"}`}>
                      {selected.includes(book.libraryBookId) ? "✓" : ""}
                    </span>
                  </button>
                ) : book.productId !== null ? (
                  <Link
                    aria-label={`${book.title} 상세 보기`}
                    className="absolute inset-0 z-10 rounded-cover focus-visible:outline-2 focus-visible:outline-primary"
                    to={`/products/${book.productId}`}
                  />
                ) : null}
                <BookCover alt="" fallbackTitle={book.title} thumbnailUrl={book.coverImageUrl} />
                <h2 className="mt-2 line-clamp-2 type-caption font-semibold text-text-primary">{book.title}</h2>
                <p className="mt-0.5 truncate text-[0.7rem] text-text-tertiary">{book.author}</p>
                {book.productId === null ? <p className="mt-1 type-caption text-error">현재 판매하지 않아요</p> : null}
              </li>
            ))}
          </ul>
        ) : null}
        {status === "ready" && books.length === 0 ? (
          <section className="page-content flex min-h-72 flex-col items-center justify-center text-center">
            <div aria-hidden="true" className="text-5xl">📚</div>
            <h2 className="mt-4 type-title">아직 담아둔 책이 없어요</h2>
            <p className="mt-2 type-body-small text-text-tertiary">AI 추천에서 마음에 드는 책을 만나보세요.</p>
            <Link className="mt-5 inline-flex min-h-11 items-center rounded-control bg-primary px-5 type-body-small font-semibold text-white" to="/recommendations/chat">AI 추천 열기</Link>
          </section>
        ) : null}
      </main>
      {isEditing ? (
        <div className="safe-area-bottom page-content absolute inset-x-0 bottom-0 border-t border-hairline bg-surface pt-3">
          <Button className="w-full bg-error" disabled={selected.length === 0} isLoading={isDeleting} onClick={() => setIsConfirming(true)}>
            선택한 책 삭제{selected.length ? ` (${selected.length})` : ""}
          </Button>
        </div>
      ) : null}
      <ConfirmDialog
        confirmLabel="삭제"
        description="나의 도서관에서만 삭제돼요."
        isOpen={isConfirming}
        onCancel={() => { if (!isDeleting) setIsConfirming(false); }}
        onConfirm={() => { void handleDelete(); }}
        title="선택한 책을 삭제할까요?"
      />
    </div>
  );
}
