import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { addLibraryBooks } from "@/features/library/api/libraryApi";
import { searchLibraryBooks } from "@/features/library/api/libraryBookSearchApi";
import { scanLibraryPhoto } from "@/features/library/api/photoScanApi";
import { PhotoScanFlow } from "@/features/library/components/PhotoScanFlow";
import type {
  LibraryLocationState,
  LibraryPhotoLocationState,
} from "@/features/library/types/photoScan";

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
        saveBooks={addLibraryBooks}
        scanPhoto={scanLibraryPhoto}
        searchBooks={searchLibraryBooks}
      />
    </div>
  );
}
