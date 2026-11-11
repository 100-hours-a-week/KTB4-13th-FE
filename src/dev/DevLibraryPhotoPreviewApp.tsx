import { MemoryRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import { AppLayout } from "@/app/layouts/AppLayout";
import { BottomNavigationLayout } from "@/app/layouts/BottomNavigationLayout";
import { Button } from "@/common/components/Button";
import { photoScanPreviewCases, type PhotoScanPreviewCase } from "@/dev/fixtures/photoScan";
import { previewLibraryApi, previewSearchBooks, resetPreviewLibrary } from "@/dev/libraryPreview";
import { createPreviewSaveBooks, createPreviewScanPhoto } from "@/dev/photoScanPreview";
import { AuthContext, type AuthContextValue } from "@/features/auth/context/authContext";
import { PhotoScanFlow } from "@/features/library/components/PhotoScanFlow";
import type { LibraryLocationState } from "@/features/library/types/photoScan";
import { LibraryPage } from "@/pages/library/LibraryPage";

const previewAuth: AuthContextValue = {
  accessToken: null,
  clearAccessToken: () => {},
  setAccessToken: () => {},
  status: "authenticated",
};

// 사진 인식 결과는 주소로 고른다: /dev/library-photo-preview?case=cover (shelf·emptyLibrary·cover·coverMissed·allMissed·noBooks·timeout·saveFailed)
function readPreviewCase(): PhotoScanPreviewCase {
  const value = new URLSearchParams(window.location.search).get("case");
  return value !== null && value in photoScanPreviewCases ? (value as PhotoScanPreviewCase) : "shelf";
}

const previewCase = readPreviewCase();
resetPreviewLibrary(photoScanPreviewCases[previewCase].isLibraryEmpty ?? false);

function PhotoScanPreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const photo = (location.state as { photo?: File } | null)?.photo;

  if (!photo) return <Navigate replace to="/my/library" />;

  return (
    <PhotoScanFlow
      initialPhoto={photo}
      onExit={() => navigate("/my/library", { replace: true })}
      onSaved={(saved) => {
        const state: LibraryLocationState = { photoScanSaved: saved };
        navigate("/my/library", { replace: true, state });
      }}
      saveBooks={createPreviewSaveBooks(previewCase)}
      scanPhoto={createPreviewScanPhoto(previewCase)}
      searchBooks={previewSearchBooks}
    />
  );
}

// 상품·챗봇 화면은 미리보기에 없어 어디로 가려 했는지만 보여 준다(비슷한 책 질문 확인용)
function LeftPreview() {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const ask = new URLSearchParams(search).get("ask");

  return (
    <div className="page-content flex min-h-dvh flex-col justify-center gap-3">
      <p className="type-caption text-text-tertiary">개발 전용 · 미리보기 밖 화면</p>
      <p className="break-all type-body font-semibold">{pathname}</p>
      {ask ? <p className="type-body-small text-text-secondary">보낼 질문: {ask}</p> : null}
      <Button onClick={() => navigate(-1)} variant="secondary">돌아가기</Button>
    </div>
  );
}

export default function DevLibraryPhotoPreviewApp() {
  return (
    <AuthContext.Provider value={previewAuth}>
      <MemoryRouter initialEntries={["/my/library"]}>
        <AppLayout>
          <Routes>
            <Route element={<BottomNavigationLayout />}>
              <Route element={<LibraryPage api={previewLibraryApi} />} path="/my/library" />
            </Route>
            <Route element={<div className="h-dvh"><PhotoScanPreview /></div>} path="/my/library/photo" />
            <Route element={<LeftPreview />} path="*" />
          </Routes>
        </AppLayout>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}
