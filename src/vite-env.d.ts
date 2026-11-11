/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_KAKAO_REDIRECT_URI: string;
  readonly VITE_KAKAO_REST_API_KEY: string;
  readonly VITE_TOSS_CLIENT_KEY?: string;
  // Dev server only: "dev-api" makes the home ranking read the dev catalog.
  readonly VITE_DEV_HOME_RANKING_SOURCE?: string;
  // Dev server only: "true" shows fixture books when the home recommendation feed is empty or fails.
  readonly VITE_DEV_HOME_RECOMMENDATION_PREVIEW?: string;
  // Dev server only: "true" shows the photo-scan entry in 나의 도서관 and calls the real BE #545–#547 APIs until they reach dev.
  readonly VITE_DEV_LIBRARY_PHOTO_SCAN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
