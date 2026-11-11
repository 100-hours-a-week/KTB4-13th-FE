import { Link } from "react-router-dom";

import { displayBookTitle } from "@/common/lib/bookTitle";
import { BookCover } from "@/common/components/BookCover";
import { Button } from "@/common/components/Button";
import { Toast } from "@/common/components/Toast";
import { PhotoPreview } from "@/features/library/components/PhotoPreview";
import { SimilarBooksLink } from "@/features/library/components/SimilarBooksLink";
import { useBookProductId } from "@/features/library/hooks/useBookProductId";
import { bookMeta } from "@/features/library/lib/bookMeta";
import type { PhotoScanBook, PhotoScanItem, SearchBooks } from "@/features/library/types/photoScan";
import { AppPageHeader } from "@/features/navigation/components/AppPageHeader";

interface PhotoScanSingleBookProps {
  isSaving: boolean;
  item: PhotoScanItem;
  onRetake: () => void;
  onSave: () => void;
  onSearch: () => void;
  photo: File;
  saveError: string | null;
  searchBooks: SearchBooks;
}

// 두 링크는 사진 화면 기록을 바꿔 넣는다(replace). 뒤로 와서 사진 화면이 다시 열리면 사진을 처음부터 다시 올리고 인식해서다
// Button 의 secondary 모양을 링크에 쓴다
const SECONDARY_LINK_CLASS_NAME =
  "inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-control border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

function ProductAction({ book, searchBooks }: { book: PhotoScanBook; searchBooks: SearchBooks }) {
  const product = useBookProductId(book, searchBooks);

  if (product.status === "loading") {
    return <Button className="min-h-12 flex-1" isLoading variant="secondary">이 책 보러 가기</Button>;
  }
  if (product.status === "found") {
    return <Link className={SECONDARY_LINK_CLASS_NAME} replace to={`/products/${product.productId}`}>이 책 보러 가기</Link>;
  }
  if (product.status === "notSold") {
    return (
      <p className="inline-flex min-h-12 flex-1 items-center justify-center rounded-control bg-muted px-3 type-caption text-text-secondary">
        현재 판매하지 않아요
      </p>
    );
  }
  // 검색에서 같은 책을 못 찾았으면 버튼을 두지 않는다
  return null;
}

function FoundBook({
  book,
  isSaving,
  onRetake,
  onSave,
  onSearch,
  photo,
  saveError,
  searchBooks,
}: Omit<PhotoScanSingleBookProps, "item"> & { book: PhotoScanBook }) {
  return (
    <div className="flex h-full flex-col bg-surface">
      <AppPageHeader fallbackPath="/my/library" showCart={false} title="찾은 책 확인" />
      <main className="page-content min-h-0 flex-1 overflow-y-auto pb-6">
        <div className="flex items-center gap-3 pt-4">
          <PhotoPreview alt="올린 사진" className="h-13.5 w-18 shrink-0 rounded-control object-cover" photo={photo} />
          <div>
            <p className="type-title">이 책을 찾았어요</p>
            <p className="type-caption text-text-secondary">사진 속 책과 같은지 확인해 주세요.</p>
          </div>
        </div>

        <section aria-labelledby="photo-scan-single-title" className="mt-6 flex flex-col items-center text-center">
          <span className="w-32">
            <BookCover alt="" fallbackTitle={book.title} priority thumbnailUrl={book.coverUrl} />
          </span>
          <h2 className="mt-4 type-heading" id="photo-scan-single-title">{displayBookTitle(book.title)}</h2>
          <p className="mt-1 type-body-small text-text-secondary">{bookMeta(book)}</p>
        </section>

        <div className="mt-6 flex gap-2">
          <ProductAction book={book} searchBooks={searchBooks} />
          <SimilarBooksLink className={SECONDARY_LINK_CLASS_NAME} replace title={book.title} />
        </div>
        <p className="mt-4 text-center type-caption text-text-secondary">
          다른 책이에요?{" "}
          <button
            className="relative font-semibold text-accent underline underline-offset-2 after:absolute after:-inset-x-1 after:-inset-y-3.5 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={onSearch}
            type="button"
          >
            검색해서 고르기
          </button>
        </p>
      </main>
      <div className="page-content shrink-0 border-t border-hairline bg-surface pb-5 pt-3">
        {saveError ? (
          <div className="pb-3">
            <Toast variant="error">{saveError}</Toast>
          </div>
        ) : null}
        <div className="flex gap-2">
          <Button className="min-h-12 shrink-0" onClick={onRetake} variant="secondary">다시 찍기</Button>
          <Button className="min-h-12 flex-1" isLoading={isSaving} onClick={onSave}>나의 도서관에 담기</Button>
        </div>
      </div>
    </div>
  );
}

function MissedBook({ onRetake, onSearch, photo, readText }: Pick<PhotoScanSingleBookProps, "onRetake" | "onSearch" | "photo"> & { readText: string }) {
  return (
    <div className="flex h-full flex-col bg-surface">
      <AppPageHeader fallbackPath="/my/library" showCart={false} title="사진으로 담기" />
      <main className="page-content flex min-h-0 flex-1 flex-col overflow-y-auto py-5">
        <div className="relative h-65.5 shrink-0 overflow-hidden rounded-panel bg-muted">
          <PhotoPreview alt="올린 사진" className="size-full object-cover" photo={photo} />
        </div>
        <h2 className="mt-6 type-heading">이 책을 찾지 못했어요</h2>
        {readText ? <p className="mt-1 type-body-small text-text-secondary">사진에서 읽은 글자: {readText}</p> : null}
        <p className="mt-5 rounded-panel bg-muted px-4 py-3.5 type-body-small">
          뒤표지(바코드가 있는 면)를 찍으면 ISBN으로 판본까지 찾을 수 있어요.
        </p>
        <div className="mt-auto flex flex-col gap-2 pt-6">
          <Button className="min-h-12 w-full" onClick={onRetake}>뒤표지 찍기</Button>
          <Button className="min-h-12 w-full" onClick={onSearch} variant="secondary">검색해서 담기</Button>
        </div>
      </main>
    </div>
  );
}

// 표지 한 권 사진의 결과. 책장 결과의 체크리스트 대신 그 책 하나와 다음에 할 일을 보여 준다
export function PhotoScanSingleBook({ item, ...props }: PhotoScanSingleBookProps) {
  if (item.state === "FOUND") return <FoundBook book={item.book} {...props} />;
  return <MissedBook onRetake={props.onRetake} onSearch={props.onSearch} photo={props.photo} readText={item.readText} />;
}
