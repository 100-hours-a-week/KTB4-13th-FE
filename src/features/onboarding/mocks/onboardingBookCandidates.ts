import type { BookCandidate } from "@/features/onboarding/types/onboarding";

// TODO(KTB4-13th-BE#129): Replace with GET /api/v1/onboarding/books and delete this file.
// These ids are display-only placeholders, not backend books.id values, so they must never be
// sent to PUT /api/v1/onboarding/books.
export const onboardingBookCandidates: BookCandidate[] = [
  { id: "book-1", title: "책의 미래", author: "김도서" },
  { id: "book-2", title: "오늘도 한 페이지", author: "이문장" },
  { id: "book-3", title: "밤의 서재", author: "박활자" },
  { id: "book-4", title: "질문하는 삶", author: "최사유" },
  { id: "book-5", title: "느린 걸음의 기록", author: "정여백" },
  { id: "book-6", title: "다시, 봄", author: "한계절" },
  { id: "book-7", title: "작은 습관의 힘", author: "윤단단" },
  { id: "book-8", title: "도시의 서점들", author: "서다연" },
  { id: "book-9", title: "우리가 몰랐던 이야기", author: "강새록" },
];
