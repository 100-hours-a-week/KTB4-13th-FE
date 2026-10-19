import { useState } from "react";

import { Button } from "@/common/components/Button";
import { ConfirmDialog } from "@/common/components/ConfirmDialog/ConfirmDialog";
import { Toast } from "@/common/components/Toast";
import { clearMockValues } from "@/common/mock/localMockStore";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { AppPageHeader } from "@/features/navigation/components/AppPageHeader";
import { requestMyProfileDeletion } from "@/features/profile/api/profileApi";
import { clearProfileImage } from "@/features/profile/lib/profileImageStore";

const REASONS = ["원하는 책을 찾기 어려워요", "서비스를 자주 사용하지 않아요", "개인정보가 걱정돼요", "기타"];
export function WithdrawPage() {
  const { logout } = useLogout();
  const [reason, setReason] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const result = await requestMyProfileDeletion();
    if (!result.ok) {
      setIsSubmitting(false);
      setIsConfirming(false);
      setError("탈퇴 처리에 실패했어요. 다시 시도해 주세요.");
      return;
    }
    clearMockValues();
    clearProfileImage();
    setIsDone(true);
    setIsConfirming(false);
    window.setTimeout(() => { void logout(); }, 900);
  };
  return <div className="relative flex h-dvh flex-col bg-surface">
    <AppPageHeader fallbackPath="/my" title="회원탈퇴" />
    <main className="page-content min-h-0 flex-1 overflow-y-auto pb-5 pt-6">
      {isDone ? <div className="mb-4"><Toast>탈퇴 처리가 완료됐어요.</Toast></div> : null}
      {error ? <div className="mb-4"><Toast variant="error">{error}</Toast></div> : null}
      <h2 className="type-section">떠나시기 전에<br />꼭 확인해 주세요</h2>
      <div className="mt-5 rounded-panel bg-accent-soft p-4"><ul className="list-disc space-y-2 pl-5 type-body-small text-text-secondary"><li>저장한 취향 정보와 나의 도서관이 삭제돼요.</li><li>작성한 리뷰와 활동 기록은 복구할 수 없어요.</li><li>주문 관련 법정 보관 정보는 정책에 따라 보관될 수 있어요.</li></ul></div>
      <fieldset className="mt-8"><legend className="type-title">탈퇴하는 이유를 알려주세요 <span className="font-normal text-text-tertiary">(선택)</span></legend><div className="mt-3 space-y-1">{REASONS.map((item) => <label className="flex min-h-12 items-center gap-3 border-b border-hairline type-body" key={item}><input checked={reason === item} className="size-5 accent-accent" name="withdraw-reason" onChange={() => setReason(item)} type="radio" />{item}</label>)}</div></fieldset>
      <label className="mt-8 flex items-start gap-3 rounded-panel border border-border p-4"><input checked={agreed} className="mt-0.5 size-5 accent-accent" onChange={(event) => setAgreed(event.target.checked)} type="checkbox" /><span className="type-body-small">안내 사항을 모두 확인했으며 탈퇴 시 정보를 복구할 수 없음에 동의합니다.</span></label>
    </main>
    <div className="safe-area-bottom page-content border-t border-hairline bg-surface pt-3"><Button className="w-full bg-error" disabled={!agreed || isDone} isLoading={isSubmitting} onClick={() => { setError(null); setIsConfirming(true); }}>탈퇴하기</Button></div>
    <ConfirmDialog confirmLabel="탈퇴하기" description="탈퇴 신청 후 7일 이내 다시 로그인하면 계정을 복구할 수 있어요." isOpen={isConfirming} onCancel={() => setIsConfirming(false)} onConfirm={() => { void confirm(); }} title="정말 탈퇴할까요?" />
  </div>;
}
