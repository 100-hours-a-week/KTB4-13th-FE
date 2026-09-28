import type {
  BookPreferenceItem,
  Category,
  SelectOption,
  Subcategory,
} from "@/features/onboarding/types/onboarding";

// TODO: 서버에서 온보딩 질문/선택지를 조회하는 API가 생기면 이 파일 대신 그 응답으로 교체한다.

export const readingTimeOptions: SelectOption[] = [
  { id: "morning", label: "아침, 하루를 시작할 때" },
  { id: "lunch", label: "점심시간이나 짧은 휴식 시간" },
  { id: "evening", label: "저녁, 하루를 마치며" },
  { id: "before-sleep", label: "잠들기 전" },
  { id: "weekend", label: "주말이나 휴일, 여유로울 때" },
];

export const bookSelectionCriteria: SelectOption[] = [
  { id: "publisher", label: "좋아하는 출판사" },
  { id: "bestseller", label: "베스트셀러" },
  { id: "review", label: "리뷰·별점 등 대중의 평가" },
];

export const mainCategories: Category[] = [
  { id: "novel", label: "소설" },
  { id: "humanities", label: "인문" },
  { id: "business", label: "경제경영" },
  { id: "self-development", label: "자기계발" },
  { id: "essay", label: "에세이" },
  { id: "lifestyle", label: "라이프스타일" },
  { id: "kids", label: "어린이" },
  { id: "science", label: "과학" },
  { id: "foreign-language", label: "외국어" },
  { id: "philosophy", label: "철학" },
  { id: "history", label: "역사" },
  { id: "travel", label: "여행" },
  { id: "society", label: "사회" },
  { id: "it", label: "IT" },
];

export const subcategoryMap: Record<string, Subcategory[]> = {
  novel: [
    { id: "novel-thriller", label: "추리/스릴러" },
    { id: "novel-sf", label: "SF" },
    { id: "novel-fantasy", label: "판타지" },
    { id: "novel-korean", label: "한국 소설" },
    { id: "novel-japanese", label: "일본 소설" },
  ],
  humanities: [
    { id: "humanities-psychology", label: "심리학" },
    { id: "humanities-reading-writing", label: "독서/글쓰기" },
    { id: "humanities-general", label: "인문학" },
    { id: "humanities-language", label: "언어" },
  ],
  business: [
    { id: "business-economy", label: "경제" },
    { id: "business-korea-economy", label: "한국 경제" },
    { id: "business-finance", label: "재테크" },
    { id: "business-marketing", label: "마케팅" },
  ],
  "self-development": [
    { id: "self-development-habit", label: "습관" },
    { id: "self-development-career", label: "커리어" },
    { id: "self-development-leadership", label: "리더십" },
    { id: "self-development-motivation", label: "동기부여" },
  ],
  essay: [
    { id: "essay-daily", label: "일상 에세이" },
    { id: "essay-travel", label: "여행 에세이" },
    { id: "essay-people", label: "인물 에세이" },
  ],
  lifestyle: [
    { id: "lifestyle-minimal", label: "미니멀 라이프" },
    { id: "lifestyle-interior", label: "인테리어" },
    { id: "lifestyle-hobby", label: "취미" },
  ],
  kids: [
    { id: "kids-picture-book", label: "그림책" },
    { id: "kids-fairy-tale", label: "동화" },
    { id: "kids-comics", label: "학습 만화" },
  ],
  science: [
    { id: "science-physics", label: "물리" },
    { id: "science-biology", label: "생물" },
    { id: "science-space", label: "우주" },
    { id: "science-brain", label: "뇌과학" },
  ],
  "foreign-language": [
    { id: "foreign-language-english", label: "영어" },
    { id: "foreign-language-japanese", label: "일본어" },
    { id: "foreign-language-chinese", label: "중국어" },
  ],
  philosophy: [
    { id: "philosophy-western", label: "서양 철학" },
    { id: "philosophy-eastern", label: "동양 철학" },
    { id: "philosophy-ethics", label: "윤리학" },
  ],
  history: [
    { id: "history-korea", label: "한국사" },
    { id: "history-world", label: "세계사" },
    { id: "history-modern", label: "근현대사" },
  ],
  travel: [
    { id: "travel-domestic", label: "국내 여행" },
    { id: "travel-abroad", label: "해외 여행" },
    { id: "travel-essay", label: "여행 에세이" },
  ],
  society: [
    { id: "society-issue", label: "사회 이슈" },
    { id: "society-politics", label: "정치" },
    { id: "society-environment", label: "환경" },
  ],
  it: [
    { id: "it-programming", label: "프로그래밍" },
    { id: "it-ai", label: "AI" },
    { id: "it-startup", label: "스타트업" },
    { id: "it-trend", label: "테크 트렌드" },
  ],
};

export const sampleBooks: BookPreferenceItem[] = [
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
