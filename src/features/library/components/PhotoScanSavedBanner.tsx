import type { PhotoScanSaved } from "@/features/library/types/photoScan";

// 사진으로 담고 나의 도서관에 돌아왔을 때 목록 위에 보여 준다
export function PhotoScanSavedBanner({ missedCount, savedCount }: PhotoScanSaved) {
  return (
    <div className="rounded-panel border border-border px-4 py-3" role="status">
      <p className="type-body font-semibold">{savedCount}권을 담았어요</p>
      {missedCount > 0 ? (
        <p className="type-caption text-text-secondary">찾지 못한 {missedCount}권은 담지 않았어요</p>
      ) : null}
    </div>
  );
}
