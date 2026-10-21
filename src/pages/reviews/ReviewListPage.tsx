import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/common/components/Button";
import { ConfirmDialog } from "@/common/components/ConfirmDialog/ConfirmDialog";
import { RetryButton } from "@/common/components/RetryButton";
import { Toast } from "@/common/components/Toast";
import { useAuth } from "@/features/auth/context/useAuth";
import { AppPageHeader } from "@/features/navigation/components/AppPageHeader";
import {
  deleteProductReview,
  fetchProductReviews,
} from "@/features/review/api/reviewApi";
import type { ProductReview } from "@/features/review/types/review";
import { useProductDetail } from "@/pages/product/hooks/useProductDetail";
import { StarRating } from "@/pages/reviews/components/StarRating";

const PAGE_SIZE = 20;

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
  const product = useProductDetail(productId);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [listStatus, setListStatus] = useState<"loading" | "ready" | "error" | "loadingMore">("loading");
  const [listError, setListError] = useState("리뷰를 불러오지 못했어요");
  const [hasNext, setHasNext] = useState(false);
  const [hasLoadMoreError, setHasLoadMoreError] = useState(false);
  const [requestKey, setRequestKey] = useState(0);
  const [visibleSpoilers, setVisibleSpoilers] = useState<number[]>([]);
  const [reviewToDelete, setReviewToDelete] = useState<ProductReview | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  useEffect(() => {
    if (productId === null) return;
    const controller = new AbortController();
    void fetchProductReviews(productId, 0, PAGE_SIZE, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      if (result.ok) {
        setReviews(result.data.reviews);
        setHasNext(result.data.hasNext);
        setListStatus("ready");
      } else {
        setListError(
          result.reason === "unauthorized"
            ? "로그인하면 리뷰를 확인할 수 있어요"
            : "리뷰를 불러오지 못했어요",
        );
        setListStatus("error");
      }
    });
    return () => controller.abort();
  }, [productId, requestKey]);

  if (!productId) {
    return <div className="page-content py-12 text-center">잘못된 도서 정보예요.</div>;
  }

  const productData = product.state.kind === "ready" ? product.state.data : null;
  const reviewCount = productData?.reviewCount ?? reviews.length;
  const average = productData?.reviewRate ?? (reviews.length
    ? reviews.reduce((sum, review) => sum + review.rate, 0) / reviews.length
    : 0);
  const notice =
    typeof location.state === "object" && location.state !== null &&
    typeof Reflect.get(location.state, "notice") === "string"
      ? String(Reflect.get(location.state, "notice"))
      : null;
  const writePath = `/products/${productId}/reviews/new`;

  const loadMore = async () => {
    if (!hasNext || listStatus === "loadingMore") return;
    setHasLoadMoreError(false);
    setListStatus("loadingMore");
    const result = await fetchProductReviews(productId, reviews.length, PAGE_SIZE);
    if (result.ok) {
      setReviews((current) => [...current, ...result.data.reviews]);
      setHasNext(result.data.hasNext);
      setListStatus("ready");
    } else {
      setHasLoadMoreError(true);
      setListStatus("ready");
    }
  };

  const handleDelete = async () => {
    if (!reviewToDelete || isDeleting) return;
    setIsDeleting(true);
    setMutationError(null);
    const result = await deleteProductReview(reviewToDelete.id);
    setIsDeleting(false);
    if (!result.ok) {
      setReviewToDelete(null);
      setMutationError("리뷰를 삭제하지 못했어요. 다시 시도해 주세요.");
      return;
    }
    setReviews((current) => current.filter((review) => review.id !== reviewToDelete.id));
    setReviewToDelete(null);
    product.retry();
  };

  return (
    <div className="relative flex h-full flex-col bg-surface">
      <AppPageHeader fallbackPath={`/products/${productId}`} title={`리뷰 ${reviewCount}`} />
      <main className="min-h-0 flex-1 overflow-y-auto pb-24">
        {notice ? <div className="page-content pt-4"><Toast>{notice}</Toast></div> : null}
        {mutationError ? <div className="page-content pt-4"><Toast variant="error">{mutationError}</Toast></div> : null}
        <section className="page-content border-b border-hairline py-6" aria-label="리뷰 별점 요약">
          <div className="flex items-center gap-5">
            <div className="min-w-24 text-center">
              <strong className="type-numeral text-text-primary">{average.toFixed(1)}</strong>
              <div className="mt-2 flex justify-center"><StarRating rating={average} /></div>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter((review) => Math.round(review.rate) === rating).length;
                const width = reviews.length ? (count / reviews.length) * 100 : 0;
                return <div className="flex items-center gap-2 type-caption text-text-tertiary" key={rating}><span>{rating}</span><span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-[#f2b84b]" style={{ width: `${width}%` }} /></span><span className="w-4 text-right tabular-nums">{count}</span></div>;
              })}
            </div>
          </div>
        </section>
        {listStatus === "loading" ? <div aria-busy="true" className="page-content space-y-4 py-5"><p className="sr-only" role="status">리뷰를 불러오는 중이에요</p>{Array.from({ length: 3 }, (_, index) => <div aria-hidden="true" className="h-32 animate-pulse rounded-panel bg-muted" key={index} />)}</div> : null}
        {listStatus === "error" ? <div className="page-content py-5"><Toast action={listError.startsWith("로그인하면") ? <button className="shrink-0 font-semibold text-accent focus-visible:outline-2 focus-visible:outline-primary" onClick={() => navigate("/login", { state: { returnTo: location.pathname } })} type="button">로그인</button> : <RetryButton onClick={() => { setListStatus("loading"); setRequestKey((current) => current + 1); }} />} variant="error">{listError}</Toast></div> : null}
        {listStatus !== "loading" && listStatus !== "error" && reviews.length === 0 ? (
          <section className="page-content flex min-h-64 flex-col items-center justify-center text-center"><h2 className="type-title">첫 리뷰를 남겨주세요</h2><p className="mt-2 type-body-small text-text-secondary">이 책을 고민하는 독자에게 도움이 돼요.</p></section>
        ) : null}
        {reviews.length ? <ul className="page-content divide-y divide-hairline">
          {reviews.map((review) => {
            const isVisible = !review.isSpoiler || visibleSpoilers.includes(review.id);
            return <li className="py-5" key={review.id}>
              <div className="flex items-start gap-3">
                <div aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft font-brand text-accent">책</div>
                <div className="min-w-0 flex-1">
                  <div className="flex min-h-8 items-start justify-between gap-3">
                    <strong className="type-body-small">{review.isMyReview ? "내 리뷰" : "구매자 리뷰"}</strong>
                    {review.isMyReview ? (
                      <span className="flex shrink-0 items-center gap-3 type-caption font-semibold">
                        <button
                          className="min-h-8 text-text-secondary focus-visible:outline-2 focus-visible:outline-primary"
                          onClick={() => navigate(`/products/${productId}/reviews/${review.id}/edit`, { state: { review } })}
                          type="button"
                        >
                          수정
                        </button>
                        <button
                          className="min-h-8 text-error focus-visible:outline-2 focus-visible:outline-primary"
                          onClick={() => { setMutationError(null); setReviewToDelete(review); }}
                          type="button"
                        >
                          삭제
                        </button>
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1"><StarRating rating={review.rate} /></div>
                  {isVisible ? <p className="mt-3 whitespace-pre-wrap type-body text-text-primary">{review.content}</p> : <button className="mt-3 min-h-11 rounded-control bg-muted px-4 type-body-small font-semibold" onClick={() => setVisibleSpoilers((ids) => [...ids, review.id])} type="button">스포일러가 포함된 리뷰예요 · 보기</button>}
                </div>
              </div>
            </li>;
          })}
        </ul> : null}
        {hasNext ? <div className="page-content pb-5">{hasLoadMoreError ? <p className="mb-2 text-center type-caption text-error">리뷰를 더 불러오지 못했어요</p> : null}<button className="min-h-11 w-full rounded-control type-body-small font-semibold text-text-secondary hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-wait disabled:text-text-tertiary" disabled={listStatus === "loadingMore"} onClick={() => { void loadMore(); }} type="button">{listStatus === "loadingMore" ? "리뷰를 더 불러오는 중이에요" : hasLoadMoreError ? "다시 불러오기" : "리뷰 더 보기"}</button></div> : null}
      </main>
      <div className="page-content absolute inset-x-0 bottom-0 border-t border-hairline bg-surface pb-5 pt-3">
        <Button className="w-full" onClick={() => status === "authenticated" ? navigate(writePath) : navigate("/login", { state: { returnTo: writePath } })}>리뷰 쓰기</Button>
      </div>
      <ConfirmDialog
        confirmLabel={isDeleting ? "삭제 중" : "삭제"}
        description="삭제한 리뷰는 복구할 수 없어요."
        isOpen={reviewToDelete !== null}
        onCancel={() => { if (!isDeleting) setReviewToDelete(null); }}
        onConfirm={() => { void handleDelete(); }}
        title="리뷰를 삭제할까요?"
      />
    </div>
  );
}
