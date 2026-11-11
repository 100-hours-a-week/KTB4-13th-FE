import { CameraIcon } from "@/common/components/AppIcons";

interface PhotoScanEntryCardProps {
  onClick: () => void;
}

// 나의 도서관 목록 위에 두는 "사진으로 담기" 입구
export function PhotoScanEntryCard({ onClick }: PhotoScanEntryCardProps) {
  return (
    <button
      className="flex min-h-18 w-full items-center gap-3 rounded-panel bg-muted px-3.5 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      onClick={onClick}
      type="button"
    >
      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-control bg-primary text-white">
        <CameraIcon aria-hidden="true" className="size-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block type-body font-semibold">사진으로 책 담기</span>
        <span className="block type-caption text-text-secondary">책장은 여러 권을, 표지는 한 권을 찾아 드려요</span>
      </span>
      <svg aria-hidden="true" className="size-5 shrink-0 text-text-secondary" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="m9 6 6 6-6 6" />
      </svg>
    </button>
  );
}
