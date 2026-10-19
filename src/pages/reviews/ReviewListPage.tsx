import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/common/components/Button";
import { Toast } from "@/common/components/Toast";
import { useAuth } from "@/features/auth/context/useAuth";
import { deleteMyMockReview, getMockReviews } from "@/features/review/mock/mockReviewRepository";
import { AppPageHeader } from "@/features/navigation/components/AppPageHeader";
import { StarRating } from "@/pages/reviews/components/StarRating";

function parseId(value: string | undefined) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export function ReviewListPage() {
  const { productId: value } = useParams();
  const productId = parseId(value);
  const location = useLocation();
  const navigate = useNavigate();
  const { status } = useAuth();
  const [version, setVersion] = useState(0);
  const [visibleSpoilers, setVisibleSpoilers] = useState<string[]>([]);
  const reviews = productId ? getMockReviews(productId) : [];
  void version;
  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;
  const notice =
    typeof location.state === "object" && location.state !== null &&
    typeof Reflect.get(location.state, "notice") === "string"
      ? String(Reflect.get(location.state, "notice"))
      : null;

  if (!productId) {
    return <div className="page-content py-12 text-center">잘못된 도서 정보예요.</div>;
  }

  const writePath = `/products/${productId}/reviews/new`;
  return (
    <div className="relative flex h-dvh flex-col bg-surface">
      <AppPageHeader fallbackPath={`/products/${productId}`} title={`리뷰 ${reviews.length}`} />
      <main className="min-h-0 flex-1 overflow-y-auto pb-24">
        {notice ? <div className="page-content pt-4"><Toast>{notice}</Toast></div> : null}
        <p className="page-content border-b border-hairline py-3 type-caption text-text-tertiary">
          실제 리뷰 조회 API가 준비되기 전까지 개발용 예시 리뷰를 보여드려요.
        </p>
        <section className="page-content border-b border-hairline py-6" aria-label="리뷰 별점 요약">
          <div className="flex items-center gap-5">
            <div className="min-w-24 text-center">
              <strong className="type-numeral text-text-primary">{average.toFixed(1)}</strong>
              <div className="mt-2 flex justify-center"><StarRating rating={Math.round(average)} /></div>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter((review) => review.rating === rating).length;
                const width = reviews.length ? (count / reviews.length) * 100 : 0;
                return <div className="flex items-center gap-2 type-caption text-text-tertiary" key={rating}><span>{rating}</span><span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-[#f2b84b]" style={{ width: `${width}%` }} /></span><span className="w-4 text-right tabular-nums">{count}</span></div>;
              })}
            </div>
          </div>
        </section>
        {reviews.length === 0 ? (
          <section className="page-content flex min-h-64 flex-col items-center justify-center text-center"><h2 className="type-title">첫 리뷰를 남겨주세요</h2><p className="mt-2 type-body-small text-text-secondary">이 책을 고민하는 독자에게 도움이 돼요.</p></section>
        ) : (
          <ul className="page-content divide-y divide-hairline">
            {reviews.map((review) => {
              const isVisible = !review.isSpoiler || visibleSpoilers.includes(review.id);
              return <li className="py-5" key={review.id}>
                <div className="flex items-start gap-3">
                  <div aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft font-brand text-accent">{review.nickname.slice(0, 1)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><strong className="type-body-small">{review.nickname}</strong>{review.isPurchased ? <span className="rounded-full bg-muted px-2 py-0.5 text-[0.7rem] text-text-secondary">구매자</span> : null}{review.isMine ? <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[0.7rem] text-accent">개발용 저장</span> : null}</div>
                    <div className="mt-1"><StarRating rating={review.rating} /></div>
                    {isVisible ? <p className="mt-3 whitespace-pre-wrap type-body text-text-primary">{review.content}</p> : <button className="mt-3 min-h-11 rounded-control bg-muted px-4 type-body-small font-semibold" onClick={() => setVisibleSpoilers((ids) => [...ids, review.id])} type="button">스포일러가 포함된 리뷰예요 · 보기</button>}
                    <time className="mt-2 block type-caption text-text-tertiary">{new Date(review.createdAt).toLocaleDateString("ko-KR")}</time>
                    {review.isMine ? <div className="mt-2 flex gap-3 type-caption"><Link className="min-h-11 py-3 font-semibold text-text-secondary" to={writePath}>수정</Link><button className="min-h-11 py-3 font-semibold text-error" onClick={() => { if (window.confirm("작성한 리뷰를 삭제할까요?")) { deleteMyMockReview(productId); setVersion((current) => current + 1); } }} type="button">삭제</button></div> : null}
                  </div>
                </div>
              </li>;
            })}
          </ul>
        )}
      </main>
      <div className="safe-area-bottom page-content absolute inset-x-0 bottom-0 border-t border-hairline bg-surface pt-3">
        <Button className="w-full" onClick={() => status === "authenticated" ? navigate(writePath) : navigate("/login", { state: { returnTo: writePath } })}>리뷰 쓰기</Button>
      </div>
    </div>
  );
}
