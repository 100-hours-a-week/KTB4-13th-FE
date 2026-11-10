import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { PhotoScanFlow } from "@/features/library/components/PhotoScanFlow";
import type {
  LibraryLocationState,
  LibraryPhotoLocationState,
  SaveScannedBooks,
  ScanPhoto,
} from "@/features/library/types/photoScan";

// TODO(BE #509): 업로드 주소 발급·인식 요청·선택 도서 저장 API 가 정해지면 실제 요청으로 바꾼다.
// 그 전까지는 개발 서버에서만 이 화면이 열리고(IS_PHOTO_SCAN_ENABLED), 개발용 결과를 돌려준다.
const scanPhoto: ScanPhoto = async (photo, options) => {
  const { createPreviewScanPhoto } = await import("@/dev/photoScanPreview");
  return createPreviewScanPhoto("shelf")(photo, options);
};

const saveBooks: SaveScannedBooks = async (isbns) => {
  const { createPreviewSaveBooks } = await import("@/dev/photoScanPreview");
  return createPreviewSaveBooks("shelf")(isbns);
};

export function LibraryPhotoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const photo = (location.state as LibraryPhotoLocationState | null)?.photo;

  // 사진 없이 주소로 바로 들어오거나 새로고침해 사진이 사라지면 도서관으로 돌려보낸다
  if (!(photo instanceof File)) return <Navigate replace to="/my/library" />;

  return (
    <div className="h-dvh">
      <PhotoScanFlow
        initialPhoto={photo}
        onExit={() => navigate("/my/library", { replace: true })}
        onSaved={(saved) => {
          const state: LibraryLocationState = { photoScanSaved: saved };
          navigate("/my/library", { replace: true, state });
        }}
        saveBooks={saveBooks}
        scanPhoto={scanPhoto}
      />
    </div>
  );
}
