import { useRef, type ChangeEvent } from "react";

import { CameraIcon } from "@/common/components/AppIcons";
import { Button } from "@/common/components/Button";
// CNU HMLAB book-spine-dataset-library (CC BY 4.0) 의 책장 사진
import shelfPhotoExample from "@/features/library/assets/shelf-photo-example.jpg";
import { LibrarySheet } from "@/features/library/components/LibrarySheet";

interface PhotoCaptureSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onPick: (photo: File) => void;
}

export function PhotoCaptureSheet({ isOpen, onClose, onPick }: PhotoCaptureSheetProps) {
  const cameraInput = useRef<HTMLInputElement>(null);
  const albumInput = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // 같은 사진을 다시 골라도 change 가 오도록 비운다
    event.target.value = "";
    if (!file) return;
    onClose();
    onPick(file);
  };

  return (
    <LibrarySheet isOpen={isOpen} onClose={onClose} title="사진으로 담기">
      <p className="mt-1 type-body-small text-text-secondary">책등이나 표지 글자를 읽어서 우리 서점의 책과 맞춰 드려요.</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <figure>
          <img
            alt="책등 글자가 또렷하게 보이는 책장 사진"
            className="h-31 w-full rounded-control bg-muted object-cover"
            src={shelfPhotoExample}
          />
          <figcaption className="mt-2 type-caption font-semibold text-success">✓ 책장은 한 칸을 가까이</figcaption>
        </figure>
        <figure>
          <img
            alt="멀리서 찍어 글자가 흐린 책장 사진"
            className="h-31 w-full rounded-control bg-muted object-contain blur-[1.6px]"
            src={shelfPhotoExample}
          />
          <figcaption className="mt-2 type-caption font-semibold text-error">✕ 멀리서 한 번에</figcaption>
        </figure>
      </div>

      <ul className="mt-4 space-y-1.5 type-body-small">
        <li>책장은 책등 글자가 보이게 정면에서, 칸마다 나눠 찍어 주세요.</li>
        <li>한 권이면 표지를 화면 가득 찍어 주세요. 뒤표지 바코드 쪽을 찍으면 판본까지 찾아요.</li>
      </ul>

      <div className="mt-5 flex flex-col gap-2">
        <Button className="min-h-12 w-full" onClick={() => cameraInput.current?.click()}>
          <CameraIcon aria-hidden="true" className="size-5" />
          사진 찍기
        </Button>
        <Button className="min-h-12 w-full" onClick={() => albumInput.current?.click()} variant="secondary">
          앨범에서 고르기
        </Button>
      </div>
      <p className="mt-3.5 text-center text-xs leading-[1.125rem] text-text-secondary">
        사진 속 글자를 읽기 위해 사진을 외부 AI 서비스로 보내요.
      </p>
      <input accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} ref={cameraInput} type="file" />
      <input accept="image/*" className="hidden" onChange={handleFileChange} ref={albumInput} type="file" />
    </LibrarySheet>
  );
}
