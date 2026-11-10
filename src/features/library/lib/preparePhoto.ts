// AI 는 JPEG·PNG 10MB 까지 받고, 긴 변 2048px 로 줄여 읽는다(AI app/photo/fetch.py).
// 휴대폰 원본(HEIC, 10MB 넘는 사진)도 보낼 수 있게 올리기 전에 같은 크기의 JPEG 로 바꾼다.
const LONG_EDGE_PX = 2048;
const JPEG_QUALITY = 0.85;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export type PreparePhotoResult =
  | { ok: true; photo: Blob }
  | { ok: false; reason: "unreadable" | "too_large" };

export async function preparePhoto(file: Blob): Promise<PreparePhotoResult> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    // 브라우저가 열지 못하는 형식(데스크톱 Chrome 의 HEIC 등)
    return { ok: false, reason: "unreadable" };
  }

  try {
    const scale = Math.min(1, LONG_EDGE_PX / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) return { ok: false, reason: "unreadable" };
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const photo = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
    });
    if (!photo) return { ok: false, reason: "unreadable" };
    if (photo.size > MAX_UPLOAD_BYTES) return { ok: false, reason: "too_large" };
    return { ok: true, photo };
  } finally {
    bitmap.close();
  }
}
