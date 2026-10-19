import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/common/components/Button";
import { Toast } from "@/common/components/Toast";
import { AppPageHeader } from "@/features/navigation/components/AppPageHeader";
import { getMockProfile, isMockNicknameAvailable, saveMockProfile } from "@/features/profile/mock/mockProfileRepository";

export function ProfileEditPage() {
  const navigate = useNavigate();
  const initial = getMockProfile();
  const inputRef = useRef<HTMLInputElement>(null);
  const [nickname, setNickname] = useState(initial.nickname);
  const [imageDataUrl, setImageDataUrl] = useState(initial.imageDataUrl);
  const [checkState, setCheckState] = useState<"idle" | "available" | "unavailable">("available");
  const [error, setError] = useState<string | null>(null);
  const normalized = nickname.trim();
  const isNicknameValid = normalized.length >= 2 && normalized.length <= 10;

  const selectImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) { setError("2MB 이하 이미지 파일을 선택해 주세요."); return; }
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === "string") { setImageDataUrl(reader.result); setError(null); } };
    reader.readAsDataURL(file);
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!isNicknameValid || checkState !== "available") { setError("닉네임 중복 확인을 완료해 주세요."); return; }
    saveMockProfile({ imageDataUrl, nickname: normalized });
    navigate("/my", { replace: true, state: { notice: "프로필을 저장했어요." } });
  };
  return <form className="relative flex h-dvh flex-col bg-surface" onSubmit={submit}>
    <AppPageHeader fallbackPath="/my" title="프로필 수정" />
    <main className="page-content min-h-0 flex-1 overflow-y-auto py-8">
      {error ? <div className="mb-5"><Toast variant="error">{error}</Toast></div> : null}
      <div className="flex flex-col items-center">
        <button aria-label="프로필 사진 변경" className="relative size-28 overflow-hidden rounded-full bg-accent-soft focus-visible:outline-2 focus-visible:outline-primary" onClick={() => inputRef.current?.click()} type="button">{imageDataUrl ? <img alt="선택한 프로필" className="size-full object-cover" src={imageDataUrl} /> : <span className="font-brand text-4xl text-accent">{normalized.slice(0, 1) || "책"}</span>}<span className="absolute inset-x-0 bottom-0 bg-black/55 py-1 type-caption text-white">사진 변경</span></button>
        <input accept="image/*" aria-label="프로필 사진 파일 선택" className="sr-only" onChange={selectImage} ref={inputRef} type="file" />
      </div>
      <section className="mt-10"><label className="type-title" htmlFor="nickname">닉네임</label><div className="mt-3 flex gap-2"><input className="min-h-12 min-w-0 flex-1 rounded-control border border-border px-3 outline-none focus:border-primary focus:outline-2 focus:outline-primary" id="nickname" maxLength={10} onChange={(event) => { setNickname(event.target.value); setCheckState("idle"); }} value={nickname} /><Button disabled={!isNicknameValid} onClick={() => setCheckState(isMockNicknameAvailable(normalized) ? "available" : "unavailable")} variant="secondary">중복 확인</Button></div><p className={`mt-2 type-caption ${checkState === "unavailable" ? "text-error" : checkState === "available" ? "text-success" : "text-text-tertiary"}`}>{checkState === "available" ? "사용할 수 있는 닉네임이에요." : checkState === "unavailable" ? "이미 사용 중인 닉네임이에요." : "2~10자의 닉네임을 입력해 주세요."}</p></section>
    </main>
    <div className="safe-area-bottom page-content border-t border-hairline bg-surface pt-3"><Button className="w-full" type="submit">저장하기</Button></div>
  </form>;
}
