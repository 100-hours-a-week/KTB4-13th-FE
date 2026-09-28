// TODO: Replace with the home personalized recommendation API once the backend defines it.
// POST /api/v1/recommend/chat is the conversational AI recommendation, not this list, and the
// frontend must not call the AI server directly. These are UI-only samples, not backend data.
export interface SampleRecommendedBook {
  author: string;
  id: string;
  price: number;
  title: string;
}

export const sampleRecommendedBooks: SampleRecommendedBook[] = [
  { id: "sample-1", title: "샘플 도서 제목 하나", author: "샘플 저자", price: 16800 },
  { id: "sample-2", title: "샘플 도서 제목 둘", author: "샘플 저자", price: 14400 },
  { id: "sample-3", title: "샘플 도서 제목 셋", author: "샘플 저자", price: 18000 },
  { id: "sample-4", title: "샘플 도서 제목 넷", author: "샘플 저자", price: 13500 },
  { id: "sample-5", title: "샘플 도서 제목 다섯", author: "샘플 저자", price: 21600 },
];
