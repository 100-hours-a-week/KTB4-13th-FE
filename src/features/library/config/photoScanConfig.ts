// 사진으로 책 담기는 BE #509(업로드·인식 전달·저장 API)가 붙기 전까지 개발 서버에서만 켠다.
// 켜면 나의 도서관에 입구가 보이고, 인식·저장은 실제 요청 없이 개발용 결과를 돌려준다.
export const IS_PHOTO_SCAN_ENABLED =
  import.meta.env.DEV && import.meta.env.VITE_DEV_LIBRARY_PHOTO_SCAN === "true";
