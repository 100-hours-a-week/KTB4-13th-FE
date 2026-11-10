import { useEffect, useRef, useState } from "react";

import { preparePhoto } from "@/features/library/lib/preparePhoto";
import type {
  PhotoScanBook,
  PhotoScanResult,
  SaveScannedBooks,
  ScanPhoto,
} from "@/features/library/types/photoScan";

export type PhotoScanStep =
  | { kind: "pick"; notice: string | null }
  | { kind: "ready" }
  | { kind: "scanning"; phase: "preparing" | "uploading" | "recognizing" }
  | { kind: "failed"; reason: "no_books" | "timeout" | "error" }
  | { kind: "result"; result: PhotoScanResult };

const PREPARE_NOTICES = {
  too_large: "사진이 너무 커요. 다른 사진을 골라 주세요.",
  unreadable: "이 사진은 열 수 없어요. JPG나 PNG 사진으로 다시 골라 주세요.",
};

export function foundBooks(result: PhotoScanResult): PhotoScanBook[] {
  const books = new Map<string, PhotoScanBook>();
  for (const item of result.items) {
    if (item.state === "FOUND" && !books.has(item.book.isbn)) {
      books.set(item.book.isbn, item.book);
    }
  }
  return [...books.values()];
}

interface UsePhotoScanOptions {
  onSaved: (count: number) => void;
  saveBooks: SaveScannedBooks;
  scanPhoto: ScanPhoto;
}

export function usePhotoScan({ onSaved, saveBooks, scanPhoto }: UsePhotoScanOptions) {
  const [step, setStep] = useState<PhotoScanStep>({ kind: "pick", notice: null });
  const [photo, setPhoto] = useState<{ file: File; url: string } | null>(null);
  const [selectedIsbns, setSelectedIsbns] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const scanController = useRef<AbortController | null>(null);
  const photoUrlRef = useRef<string | null>(null);

  // 화면을 떠나면 진행 중인 인식을 멈추고 미리보기 주소를 돌려준다
  useEffect(
    () => () => {
      scanController.current?.abort();
      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    },
    [],
  );

  const replacePhoto = (file: File | null) => {
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    photoUrlRef.current = file ? URL.createObjectURL(file) : null;
    setPhoto(file && photoUrlRef.current ? { file, url: photoUrlRef.current } : null);
  };

  const choosePhoto = (file: File) => {
    replacePhoto(file);
    setStep({ kind: "ready" });
  };

  const reset = () => {
    scanController.current?.abort();
    scanController.current = null;
    replacePhoto(null);
    setSelectedIsbns([]);
    setSaveError(null);
    setStep({ kind: "pick", notice: null });
  };

  const startScan = async () => {
    if (!photo || step.kind === "scanning") return;
    const controller = new AbortController();
    scanController.current = controller;
    setStep({ kind: "scanning", phase: "preparing" });

    const prepared = await preparePhoto(photo.file);
    if (controller.signal.aborted) return;
    if (!prepared.ok) {
      replacePhoto(null);
      setStep({ kind: "pick", notice: PREPARE_NOTICES[prepared.reason] });
      return;
    }

    const scanned = await scanPhoto(prepared.photo, {
      onPhase: (phase) => {
        if (!controller.signal.aborted) setStep({ kind: "scanning", phase });
      },
      signal: controller.signal,
    });
    if (controller.signal.aborted) return;
    scanController.current = null;

    if (!scanned.ok) {
      setStep({ kind: "failed", reason: scanned.reason });
      return;
    }
    if (scanned.data.photoType === "none" || scanned.data.items.length === 0) {
      setStep({ kind: "failed", reason: "no_books" });
      return;
    }
    setSelectedIsbns(foundBooks(scanned.data).map((book) => book.isbn));
    setStep({ kind: "result", result: scanned.data });
  };

  const toggleBook = (isbn: string) => {
    setSelectedIsbns((isbns) =>
      isbns.includes(isbn) ? isbns.filter((value) => value !== isbn) : [...isbns, isbn],
    );
  };

  const saveSelected = async () => {
    if (isSaving || selectedIsbns.length === 0) return;
    setIsSaving(true);
    setSaveError(null);
    const saved = await saveBooks(selectedIsbns);
    setIsSaving(false);
    if (!saved.ok) {
      setSaveError("책을 담지 못했어요. 다시 시도해 주세요.");
      return;
    }
    onSaved(selectedIsbns.length);
  };

  return {
    choosePhoto,
    isSaving,
    photoUrl: photo?.url ?? null,
    reset,
    saveError,
    saveSelected,
    selectedIsbns,
    startScan,
    step,
    toggleBook,
  };
}
