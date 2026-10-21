import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/common/components/Button";
import { Toast } from "@/common/components/Toast";
import { AppPageHeader } from "@/features/navigation/components/AppPageHeader";
import { fetchMyProfile, updateMyProfile } from "@/features/profile/api/profileApi";
import { DEFAULT_PROFILE_IMAGE_URL } from "@/features/profile/lib/profileImageStore";

export function ProfileEditPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const normalized = nickname.trim();
  const isNicknameValid = normalized.length >= 2 && normalized.length <= 20;

  useEffect(() => {
    const controller = new AbortController();
    void fetchMyProfile(controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      if (result.ok) {
        setNickname(result.nickname);
      } else {
        setError("내 정보를 불러오지 못했어요. 다시 들어와 주세요.");
      }
      setIsLoading(false);
    });
    return () => controller.abort();
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isNicknameValid || isSubmitting) { setError("2~20자의 닉네임을 입력해 주세요."); return; }
    setIsSubmitting(true);
    const result = await updateMyProfile(normalized);
    if (!result.ok) {
      setIsSubmitting(false);
      setError(result.reason === "invalid-nickname" ? "2~20자의 닉네임을 입력해 주세요." : "프로필을 저장하지 못했어요. 다시 시도해 주세요.");
      return;
    }
    navigate("/my", { replace: true, state: { notice: "프로필을 저장했어요." } });
  };
  return <form className="relative flex h-full flex-col bg-surface" onSubmit={submit}>
    <AppPageHeader fallbackPath="/my" title="프로필 수정" />
    <main className="page-content min-h-0 flex-1 overflow-y-auto py-8">
      {error ? <div className="mb-5"><Toast variant="error">{error}</Toast></div> : null}
      <div className="flex flex-col items-center"><img alt="기본 프로필 이미지" className="size-28 rounded-full bg-accent-soft object-contain p-1" src={DEFAULT_PROFILE_IMAGE_URL} /></div>
      <section className="mt-10"><label className="type-title" htmlFor="nickname">닉네임</label><div className="mt-3"><input className="min-h-12 w-full rounded-control border border-border px-3 outline-none focus:border-primary focus:outline-2 focus:outline-primary" disabled={isLoading} id="nickname" maxLength={20} onChange={(event) => { setNickname(event.target.value); setError(null); }} value={nickname} /></div><p className="mt-2 type-caption text-text-tertiary">2~20자의 닉네임을 입력해 주세요.</p></section>
    </main>
    <div className="page-content border-t border-hairline bg-surface pb-5 pt-3"><Button className="w-full" disabled={isLoading || !isNicknameValid} isLoading={isSubmitting} type="submit">저장하기</Button></div>
  </form>;
}
