import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { BookCover } from "@/common/components/BookCover";
import { Button } from "@/common/components/Button";
import { AppPageHeader } from "@/features/navigation/components/AppPageHeader";
import { getMyMockReview, saveMockReview } from "@/features/review/mock/mockReviewRepository";
import { useProductDetail } from "@/pages/product/hooks/useProductDetail";
import { StarRating } from "@/pages/reviews/components/StarRating";

const MIN_LENGTH = 10;
const MAX_LENGTH = 500;

export function ReviewWritePage() {
  const value = useParams().productId;
  const productId = Number(value);
  const navigate = useNavigate();
  const existing = Number.isSafeInteger(productId) ? getMyMockReview(productId) : null;
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [content, setContent] = useState(existing?.content ?? "");
  const [isSpoiler, setIsSpoiler] = useState(existing?.isSpoiler ?? false);
  const [submitted, setSubmitted] = useState(false);
  const { state } = useProductDetail(Number.isSafeInteger(productId) ? productId : null);
  const product = state.kind === "ready" ? state.data : null;
  const isValid = rating > 0 && content.trim().length >= MIN_LENGTH;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (!isValid) return;
    const result = saveMockReview(productId, { content: content.trim(), isSpoiler, rating });
    navigate(`/products/${productId}/reviews`, { replace: true, state: { notice: result === "created" ? "리뷰를 등록했어요." : "리뷰를 수정했어요." } });
  };

  return (
    <form className="relative flex h-dvh flex-col bg-surface" onSubmit={submit}>
      <AppPageHeader fallbackPath={`/products/${productId}/reviews`} title={existing ? "리뷰 수정" : "리뷰 쓰기"} />
      <main className="min-h-0 flex-1 overflow-y-auto pb-24">
        <section className="page-content flex gap-3 border-b border-hairline py-5">
          <div className="w-14 shrink-0"><BookCover alt="" fallbackTitle={product?.itemName ?? "도서"} thumbnailUrl={product?.thumbnailUrl ?? null} /></div>
          <div className="min-w-0 self-center"><span className="rounded-full bg-accent-soft px-2 py-1 type-caption font-semibold text-accent">구매한 책</span><h2 className="mt-2 line-clamp-2 type-title">{product?.itemName ?? "리뷰를 작성할 도서"}</h2></div>
        </section>
        <p className="page-content border-b border-hairline py-3 type-caption text-text-tertiary">
          현재 작성한 리뷰는 서버에 등록되지 않고 이 기기에 개발용 Mock으로만 저장돼요.
        </p>
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
      <div className="safe-area-bottom page-content absolute inset-x-0 bottom-0 border-t border-hairline bg-surface pt-3"><Button className="w-full" type="submit">{existing ? "수정 완료" : "리뷰 등록"}</Button></div>
    </form>
  );
}
