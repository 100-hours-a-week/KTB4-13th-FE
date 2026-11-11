// 사진으로 책 담기는 BE #545~#547(담기·업로드 주소·인식)이 dev 에 배포될 때까지 개발 서버에서만 켠다.
// 켜면 나의 도서관에 입구가 보이고, 올리기·인식·담기는 VITE_API_BASE_URL 의 BE 로 실제 요청을 보낸다.
export const IS_PHOTO_SCAN_ENABLED =
  import.meta.env.DEV && import.meta.env.VITE_DEV_LIBRARY_PHOTO_SCAN === "true";
