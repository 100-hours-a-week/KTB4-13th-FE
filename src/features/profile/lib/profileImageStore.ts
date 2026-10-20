const STORAGE_KEY = "bookjeok:profile-image";
const LEGACY_STORAGE_KEY = "bookjeok:mock:profile";

export const DEFAULT_PROFILE_IMAGE_URL = `${import.meta.env.BASE_URL}assets/(nobg)bookjeok-character.png`;

export function getProfileImage() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored !== null) return stored;

  try {
    const legacy = JSON.parse(window.localStorage.getItem(LEGACY_STORAGE_KEY) ?? "null") as unknown;
    const imageDataUrl =
      typeof legacy === "object" &&
      legacy !== null &&
      typeof Reflect.get(legacy, "imageDataUrl") === "string"
        ? String(Reflect.get(legacy, "imageDataUrl"))
        : null;
    if (imageDataUrl !== null) saveProfileImage(imageDataUrl);
    return imageDataUrl;
  } catch {
    return null;
  }
}

export function saveProfileImage(imageDataUrl: string | null) {
  if (imageDataUrl === null) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, imageDataUrl);
}

export function clearProfileImage() {
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(LEGACY_STORAGE_KEY);
}
