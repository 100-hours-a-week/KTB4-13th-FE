import { readMockValue, writeMockValue } from "@/common/mock/localMockStore";

export interface MockLibraryBook { author: string; id: string; productId: number; thumbnailUrl: string | null; title: string; }
const STORAGE_KEY = "library";
const SEED: MockLibraryBook[] = [
  { author: "김초엽", id: "library-1", productId: 1, thumbnailUrl: null, title: "우리가 빛의 속도로 갈 수 없다면" },
  { author: "최은영", id: "library-2", productId: 2, thumbnailUrl: null, title: "아주 희미한 빛으로도" },
  { author: "정세랑", id: "library-3", productId: 3, thumbnailUrl: null, title: "피프티 피플" },
  { author: "김호연", id: "library-4", productId: 4, thumbnailUrl: null, title: "불편한 편의점" },
  { author: "한강", id: "library-5", productId: 5, thumbnailUrl: null, title: "작별하지 않는다" },
  { author: "양귀자", id: "library-6", productId: 6, thumbnailUrl: null, title: "모순" },
];
export function getMockLibraryBooks() { return readMockValue<MockLibraryBook[]>(STORAGE_KEY, SEED); }
export function deleteMockLibraryBooks(ids: string[]) { writeMockValue(STORAGE_KEY, getMockLibraryBooks().filter((book) => !ids.includes(book.id))); }
export function addMockLibraryBook(book: MockLibraryBook) { const books = getMockLibraryBooks(); if (!books.some((item) => item.productId === book.productId)) writeMockValue(STORAGE_KEY, [book, ...books]); }
