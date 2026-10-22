import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { BookCover } from "@/common/components/BookCover";
import { Button } from "@/common/components/Button";
import { Toast } from "@/common/components/Toast";
import { AppPageHeader } from "@/features/navigation/components/AppPageHeader";
import { fetchOrderDetail } from "@/features/order/api/orderApi";
import {
  createProductReview,
  updateProductReview,
} from "@/features/review/api/reviewApi";
import type { ProductReview } from "@/features/review/types/review";
import { useProductDetail } from "@/pages/product/hooks/useProductDetail";
import { StarRating } from "@/pages/reviews/components/StarRating";

const MIN_LENGTH = 10;
const MAX_LENGTH = 255;

export function ReviewWritePage() {
  const { productId: value, reviewId: reviewIdValue } = useParams();
  const productId = Number(value);
  const isProductIdValid = Number.isSafeInteger(productId) && productId > 0;
  const reviewId = Number(reviewIdValue);
  const isEditing = reviewIdValue !== undefined;
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const orderKey = query.get("orderKey") ?? "";
  const orderItemId = Number(query.get("orderItemId"));
  const hasOrderContext = orderKey.length > 0 && Number.isSafeInteger(orderItemId) && orderItemId > 0;
  const [orderAccess, setOrderAccess] = useState<{
    orderKey: string;
    orderItemId: number;
    status: "loading" | "allowed" | "denied";
  } | null>(null);
  const review =
    typeof location.state === "object" &&
    location.state !== null &&
    typeof Reflect.get(location.state, "review") === "object"
      ? (Reflect.get(location.state, "review") as ProductReview)
      : null;
  const canEdit =
    isEditing &&
    Number.isSafeInteger(reviewId) &&
    reviewId > 0 &&
    review?.id === reviewId &&
    review.productId === productId &&
    review.isMyReview;
  const [rating, setRating] = useState(canEdit ? review.rate : 0);
  const [content, setContent] = useState(canEdit ? review.content : "");
  const [isSpoiler, setIsSpoiler] = useState(canEdit ? review.isSpoiler : false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { state } = useProductDetail(isProductIdValid ? productId : null);
  const product = state.kind === "ready" ? state.data : null;
  const isValid = isProductIdValid && rating > 0 && content.trim().length >= MIN_LENGTH;

  useEffect(() => {
    if (isEditing || !isProductIdValid || !hasOrderContext) return;
    const controller = new AbortController();
    void fetchOrderDetail(orderKey, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      const eligibleItem = result.ok && result.data.key === orderKey &&
        result.data.status === "PAID" && result.data.payment !== null &&
        result.data.items.some((item) => item.orderItemId === orderItemId &&
          item.productId === productId && item.quantity > item.canceledQuantity);
      setOrderAccess({ orderKey, orderItemId, status: eligibleItem ? "allowed" : "denied" });
    });
    return () => controller.abort();
  }, [hasOrderContext, isEditing, isProductIdValid, orderItemId, orderKey, productId]);

  const canCreate = !isEditing && hasOrderContext &&
    orderAccess?.orderKey === orderKey && orderAccess.orderItemId === orderItemId &&
    orderAccess.status === "allowed";

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (!isValid || isSubmitting || (!isEditing && !canCreate)) return;
    setIsSubmitting(true);
    setError(null);
    const result = canEdit
      ? await updateProductReview(reviewId, {
          content: content.trim(),
          isSpoiler,
          rate: rating,
        })
      : await createProductReview({
          content: content.trim(),
          isSpoiler,
          productId,
          rate: rating,
        });
    if (!result.ok) {
      setIsSubmitting(false);
      setError(result.reason === "invalid-request" ? "구매 내역이나 기존 리뷰를 확인해 주세요." : `리뷰를 ${canEdit ? "수정" : "등록"}하지 못했어요. 다시 시도해 주세요.`);
      return;
    }
    navigate(`/products/${productId}/reviews`, {
      replace: true,
      state: { notice: isEditing ? "리뷰를 수정했어요." : "리뷰를 등록했어요." },
    });
  };

  if (isEditing && !canEdit) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <AppPageHeader fallbackPath={`/products/${productId}/reviews`} title="리뷰 수정" />
        <main className="page-content flex flex-1 flex-col items-center justify-center text-center">
          <h2 className="type-title">수정할 리뷰 정보를 찾지 못했어요</h2>
          <p className="mt-2 type-body-small text-text-tertiary">리뷰 목록에서 다시 선택해 주세요.</p>
          <Button className="mt-5" onClick={() => navigate(`/products/${productId}/reviews`, { replace: true })}>리뷰 목록으로</Button>
        </main>
      </div>
    );
  }

  if (!isEditing && !canCreate) {
    const isLoading = hasOrderContext && (
      orderAccess?.orderKey !== orderKey ||
      orderAccess.orderItemId !== orderItemId ||
      orderAccess.status === "loading"
    );
    return (
      <div className="flex h-full flex-col bg-surface">
        <AppPageHeader fallbackPath="/my/orders" title="리뷰 쓰기" />
        <main className="page-content flex flex-1 flex-col items-center justify-center text-center">
          <h2 className="type-title">{isLoading ? "구매 내역을 확인하고 있어요" : "구매 내역에서 리뷰를 작성해 주세요"}</h2>
          <p className="mt-2 type-body-small text-text-secondary">
            {isLoading ? "잠시만 기다려 주세요." : "결제 완료된 주문상품에서 리뷰 작성으로 이동할 수 있어요."}
          </p>
          {!isLoading ? <Button className="mt-5" onClick={() => navigate("/my/orders", { replace: true })}>구매 내역 보기</Button> : null}
        </main>
      </div>
    );
  }

  return (
    <form className="relative flex h-full flex-col bg-surface" onSubmit={submit}>
      <AppPageHeader fallbackPath={`/products/${productId}/reviews`} title={isEditing ? "리뷰 수정" : "리뷰 쓰기"} />
      <main className="min-h-0 flex-1 overflow-y-auto pb-24">
        {error ? <div className="page-content pt-4"><Toast variant="error">{error}</Toast></div> : null}
        <section className="page-content flex gap-3 border-b border-hairline py-5">
          <div className="w-14 shrink-0"><BookCover alt="" fallbackTitle={product?.itemName ?? "도서"} thumbnailUrl={product?.thumbnailUrl ?? null} /></div>
          <div className="min-w-0 self-center"><span className="rounded-full bg-accent-soft px-2 py-1 type-caption font-semibold text-accent">구매한 책</span><h2 className="mt-2 line-clamp-2 type-title">{product?.itemName ?? "리뷰를 작성할 도서"}</h2></div>
        </section>
        <section className="page-content border-b border-hairline py-7 text-center">
          <h2 className="type-title">이 책은 어떠셨나요?</h2>
          <div className="mt-3 flex justify-center"><StarRating onChange={setRating} rating={rating} size="large" /></div>
          {submitted && rating === 0 ? <p className="mt-2 type-caption text-error">별점을 선택해 주세요.</p> : null}
        </section>
        <section className="page-content py-6">
          <label className="type-title" htmlFor="review-content">리뷰</label>
          <textarea className="mt-3 min-h-44 w-full resize-none rounded-panel border border-border p-4 type-body outline-none placeholder:text-text-tertiary focus:border-primary focus:outline-2 focus:outline-primary" id="review-content" maxLength={MAX_LENGTH} onChange={(event) => setContent(event.target.value)} placeholder="책에 대한 솔직한 감상을 10자 이상 남겨주세요." value={content} />
          <div className="mt-1 flex justify-between type-caption"><span className={submitted && content.trim().length < MIN_LENGTH ? "text-error" : "text-text-tertiary"}>{submitted && content.trim().length < MIN_LENGTH ? "10자 이상 입력해 주세요." : "다른 독자에게 도움이 되는 리뷰를 남겨주세요."}</span><span className="tabular-nums text-text-tertiary">{content.length}/{MAX_LENGTH}</span></div>
          <label className="mt-6 flex min-h-14 items-center justify-between border-y border-hairline py-2"><span><strong className="block type-body">스포일러 포함</strong><span className="type-caption text-text-tertiary">내용을 가려서 보여드려요.</span></span><input checked={isSpoiler} className="size-5 accent-accent" onChange={(event) => setIsSpoiler(event.target.checked)} type="checkbox" /></label>
        </section>
      </main>
      <div className="page-content absolute inset-x-0 bottom-0 border-t border-hairline bg-surface pb-5 pt-3"><Button className="w-full" isLoading={isSubmitting} type="submit">{isEditing ? "리뷰 수정" : "리뷰 등록"}</Button></div>
    </form>
  );
}
