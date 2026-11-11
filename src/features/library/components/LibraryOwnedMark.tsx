import { Link } from "react-router-dom";

// 검색 결과·상품 상세에서 이미 나의 도서관에 담은 책이라고 알려 준다
export function LibraryOwnedMark({ asLink = false }: { asLink?: boolean }) {
  if (!asLink) {
    return <p className="type-caption font-semibold text-success">✓ 내 도서관에 있어요</p>;
  }

  return (
    <Link
      className="inline-flex min-h-9 items-center gap-1 rounded-full bg-muted px-3 type-caption font-semibold text-success focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      to="/my/library"
    >
      ✓ 나의 도서관에 있는 책
      <span aria-hidden="true" className="text-text-tertiary">›</span>
    </Link>
  );
}
