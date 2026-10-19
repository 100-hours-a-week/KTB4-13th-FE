import { readMockValue, writeMockValue } from "@/common/mock/localMockStore";

export interface MockReview {
  content: string;
  createdAt: string;
  id: string;
  isMine: boolean;
  isPurchased: boolean;
  isSpoiler: boolean;
  nickname: string;
  productId: number;
  rating: number;
}

type ReviewMap = Record<string, MockReview[]>;
const STORAGE_KEY = "reviews";

function seed(productId: number): MockReview[] {
  return [
    {
      content: "문장이 편안해서 천천히 아껴 읽고 싶은 책이었어요.",
      createdAt: "2026-10-13T11:30:00+09:00",
      id: `seed-${productId}-1`,
      isMine: false,
      isPurchased: true,
      isSpoiler: false,
      nickname: "한쪽씩",
      productId,
      rating: 5,
    },
    {
      content: "결말에 대한 내용이 포함되어 있어요.",
      createdAt: "2026-10-08T20:10:00+09:00",
      id: `seed-${productId}-2`,
      isMine: false,
      isPurchased: true,
      isSpoiler: true,
      nickname: "밤의독자",
      productId,
      rating: 4,
    },
  ];
}

function readMap() {
  return readMockValue<ReviewMap>(STORAGE_KEY, {});
}

export function getMockReviews(productId: number) {
  const map = readMap();
  return map[String(productId)] ?? seed(productId);
}

export function getMyMockReview(productId: number) {
  return getMockReviews(productId).find((review) => review.isMine) ?? null;
}

export function saveMockReview(
  productId: number,
  input: Pick<MockReview, "content" | "isSpoiler" | "rating">,
) {
  const map = readMap();
  const reviews = map[String(productId)] ?? seed(productId);
  const existing = reviews.find((review) => review.isMine);
  const next: MockReview = {
    ...input,
    createdAt: new Date().toISOString(),
    id: existing?.id ?? `mine-${productId}`,
    isMine: true,
    isPurchased: true,
    nickname: "책벌레",
    productId,
  };
  map[String(productId)] = [next, ...reviews.filter((review) => !review.isMine)];
  writeMockValue(STORAGE_KEY, map);
  return existing ? "updated" : "created";
}

export function deleteMyMockReview(productId: number) {
  const map = readMap();
  map[String(productId)] = getMockReviews(productId).filter(
    (review) => !review.isMine,
  );
  writeMockValue(STORAGE_KEY, map);
}
