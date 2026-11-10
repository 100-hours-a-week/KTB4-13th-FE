import { useEffect, useEffectEvent, useState } from "react";

import { preparePhoto } from "@/features/library/lib/preparePhoto";
import type {
  PhotoScanBook,
  PhotoScanResult,
  PhotoScanSaved,
  SaveScannedBooks,
  ScanPhoto,
} from "@/features/library/types/photoScan";

export type PhotoScanFailureReason = "unreadable" | "too_large" | "no_books" | "timeout" | "error";

export type PhotoScanStep =
  | { kind: "scanning"; phase: "preparing" | "uploading" | "recognizing" }
  | { kind: "failed"; reason: PhotoScanFailureReason }
  | { kind: "result"; result: PhotoScanResult };

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
  initialPhoto: File;
  onSaved: (saved: PhotoScanSaved) => void;
  saveBooks: SaveScannedBooks;
  scanPhoto: ScanPhoto;
}

const SCANNING: PhotoScanStep = { kind: "scanning", phase: "preparing" };

type ScanOutcome =
  | { kind: "failed"; reason: PhotoScanFailureReason }
  | { kind: "result"; result: PhotoScanResult };

async function scanOnce(
  file: File,
  scan: ScanPhoto,
  options: Parameters<ScanPhoto>[1],
): Promise<ScanOutcome> {
  const prepared = await preparePhoto(file);
  if (!prepared.ok) return { kind: "failed", reason: prepared.reason };
  const scanned = await scan(prepared.photo, options);
  if (!scanned.ok) return { kind: "failed", reason: scanned.reason };
  if (scanned.data.photoType === "none" || scanned.data.items.length === 0) {
    return { kind: "failed", reason: "no_books" };
  }
  return { kind: "result", result: scanned.data };
}

export function usePhotoScan({ initialPhoto, onSaved, saveBooks, scanPhoto }: UsePhotoScanOptions) {
  const [photo, setPhoto] = useState(initialPhoto);
  // 같은 사진으로 다시 시도할 때 올린다
  const [attempt, setAttempt] = useState(0);
  const [step, setStep] = useState<PhotoScanStep>(SCANNING);
  const [selectedIsbns, setSelectedIsbns] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  // 부모가 렌더마다 새 함수를 넘겨도 인식을 다시 시작하지 않게 한다
  const callScanPhoto = useEffectEvent((...args: Parameters<ScanPhoto>) => scanPhoto(...args));

  // 사진이 바뀌거나 다시 시도하면 처음부터 인식한다. 화면을 떠나면 진행 중인 요청을 멈춘다
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    void scanOnce(photo, callScanPhoto, {
      onPhase: (phase) => {
        if (!signal.aborted) setStep({ kind: "scanning", phase });
      },
      signal,
    }).then((outcome) => {
      if (signal.aborted) return;
      if (outcome.kind === "result") {
        setSelectedIsbns(foundBooks(outcome.result).map((book) => book.isbn));
      }
      setStep(outcome);
    });
    return () => controller.abort();
  }, [photo, attempt]);

  const retake = (file: File) => {
    setSaveError(null);
    setSelectedIsbns([]);
    setStep(SCANNING);
    setPhoto(file);
  };

  const retry = () => {
    setStep(SCANNING);
    setAttempt((value) => value + 1);
  };

  const toggleBook = (isbn: string) => {
    setSelectedIsbns((isbns) =>
      isbns.includes(isbn) ? isbns.filter((value) => value !== isbn) : [...isbns, isbn],
    );
  };

  const saveSelected = async () => {
    if (isSaving || selectedIsbns.length === 0 || step.kind !== "result") return;
    setIsSaving(true);
    setSaveError(null);
    const saved = await saveBooks(selectedIsbns);
    setIsSaving(false);
    if (!saved.ok) {
      setSaveError("책을 담지 못했어요. 다시 시도해 주세요.");
      return;
    }
    onSaved({
      missedCount: step.result.items.filter((item) => item.state === "NOT_FOUND").length,
      savedCount: selectedIsbns.length,
    });
  };

  return {
    isSaving,
    photo,
    retake,
    retry,
    saveError,
    saveSelected,
    selectedIsbns,
    step,
    toggleBook,
  };
}
