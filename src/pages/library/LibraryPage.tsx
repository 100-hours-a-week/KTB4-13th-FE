import { useState } from "react";
import { Link } from "react-router-dom";

import { BookCover } from "@/common/components/BookCover";
import { Button } from "@/common/components/Button";
import { CameraIcon } from "@/common/components/AppIcons";
import { ConfirmDialog } from "@/common/components/ConfirmDialog/ConfirmDialog";
import { AppPageHeader } from "@/features/navigation/components/AppPageHeader";
import { deleteMockLibraryBooks, getMockLibraryBooks } from "@/features/library/mock/mockLibraryRepository";

export function LibraryPage() {
  const [version, setVersion] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);
  const books = getMockLibraryBooks();
  void version;
  const toggle = (id: string) => setSelected((ids) => ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id]);
  const finishEditing = () => { setIsEditing(false); setSelected([]); };
  return <div className="relative flex h-dvh flex-col bg-surface">
    <AppPageHeader action={<button className="min-h-11 text-right type-body-small font-semibold" onClick={() => isEditing ? finishEditing() : setIsEditing(true)} type="button">{isEditing ? "완료" : "편집"}</button>} fallbackPath="/my" title="나의 도서관" />
    <main className="min-h-0 flex-1 overflow-y-auto pb-24">
      <div className="page-content flex min-h-14 items-center"><strong className="type-body">담아둔 책 {books.length}</strong></div>
      <Link className="page-content mx-5 flex min-h-20 items-center gap-3 rounded-panel bg-accent-soft py-3 text-accent focus-visible:outline-2 focus-visible:outline-primary" to="/recommendations/scan"><span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface"><CameraIcon className="size-6" /></span><span><strong className="block type-title">책장을 찍어 책 찾기</strong><span className="type-caption text-text-secondary">사진 한 장으로 내 책을 서재에 담아요.</span></span><span aria-hidden="true" className="ml-auto">›</span></Link>
      {books.length ? <ul className="page-content mt-6 grid grid-cols-3 gap-x-3 gap-y-6">{books.map((book) => <li className="relative" key={book.id}>{isEditing ? <button aria-label={`${book.title} ${selected.includes(book.id) ? "선택 해제" : "선택"}`} className="absolute inset-0 z-10 rounded-cover focus-visible:outline-2 focus-visible:outline-primary" onClick={() => toggle(book.id)} type="button"><span className={`absolute right-1 top-1 flex size-6 items-center justify-center rounded-full border-2 text-xs ${selected.includes(book.id) ? "border-accent bg-accent text-white" : "border-white bg-black/25 text-white"}`}>{selected.includes(book.id) ? "✓" : ""}</span></button> : <Link aria-label={`${book.title} 상세 보기`} className="absolute inset-0 z-10 rounded-cover focus-visible:outline-2 focus-visible:outline-primary" to={`/products/${book.productId}`} />}<BookCover alt="" fallbackTitle={book.title} thumbnailUrl={book.thumbnailUrl} /><h2 className="mt-2 line-clamp-2 type-caption font-semibold text-text-primary">{book.title}</h2><p className="mt-0.5 truncate text-[0.7rem] text-text-tertiary">{book.author}</p></li>)}</ul> : <section className="page-content flex min-h-72 flex-col items-center justify-center text-center"><div aria-hidden="true" className="text-5xl">📚</div><h2 className="mt-4 type-title">아직 담아둔 책이 없어요</h2><p className="mt-2 type-body-small text-text-tertiary">AI 추천에서 마음에 드는 책을 만나보세요.</p><Link className="mt-5 inline-flex min-h-11 items-center rounded-control bg-primary px-5 type-body-small font-semibold text-white" to="/recommendations/chat">AI 추천 열기</Link></section>}
    </main>
    {isEditing ? <div className="safe-area-bottom page-content absolute inset-x-0 bottom-0 border-t border-hairline bg-surface pt-3"><Button className="w-full bg-error" disabled={!selected.length} onClick={() => setIsConfirming(true)}>선택한 책 삭제{selected.length ? ` (${selected.length})` : ""}</Button></div> : null}
    <ConfirmDialog confirmLabel="삭제" description="나의 도서관에서만 삭제돼요." isOpen={isConfirming} onCancel={() => setIsConfirming(false)} onConfirm={() => { deleteMockLibraryBooks(selected); setSelected([]); setIsConfirming(false); setVersion((v) => v + 1); }} title="선택한 책을 삭제할까요?" />
  </div>;
}
