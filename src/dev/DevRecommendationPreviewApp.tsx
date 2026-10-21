import { BrowserRouter } from "react-router-dom";

import { AppLayout } from "@/app/layouts/AppLayout";
import type { RecommendationFeedItem } from "@/features/recommendation/types/recommendationFeed";
import { CoverflowRecommendations } from "@/pages/home/components/RecommendationSection";

const covers = [
  ["싯다르타", "9788937460586.webp"],
  ["데미안", "9788937460449.webp"],
  ["브람스를 좋아하세요", "9788937461798.webp"],
  ["급류", "9788937473401.webp"],
  ["인간 실격", "9788937461033.webp"],
  ["이방인", "9788937443848.webp"],
  ["82년생 김지영", "9788937473135.webp"],
  ["1984", "9788937460777.jpg"],
  ["오만과 편견", "9788937460883.webp"],
  ["동물농장", "9788937460050.webp"],
  ["체호프 단편선", "9788937460708.webp"],
  ["호밀밭의 파수꾼", "9788937460470.webp"],
  ["참을 수 없는 존재의 가벼움", "9788937437564.webp"],
  ["달과 6펜스", "9788937460388.webp"],
  ["노르웨이의 숲", "9788937434488.webp"],
  ["노인과 바다", "9788937462788.webp"],
  ["설국", "9788937460616.webp"],
  ["위대한 개츠비", "9788937460753.webp"],
] as const;

const books: RecommendationFeedItem[] = covers.map(([title, cover], index) => ({
  author: "미리보기 저자",
  bookId: index + 1,
  coverUrl: `https://cdn.bookjeok.com/covers/${cover}`,
  inStock: true,
  matchScore: 90,
  price: 12000,
  productId: index + 1,
  title,
}));

export default function DevRecommendationPreviewApp() {
  return (
    <BrowserRouter>
      <AppLayout>
        <main className="min-h-dvh bg-surface pt-10">
          <section className="page-content min-w-0 overflow-x-clip py-8">
            <h1 className="mb-6 type-title text-text-primary">추천 도서 캐러셀 미리보기</h1>
            <CoverflowRecommendations books={books} onProductClick={() => {}} />
          </section>
        </main>
      </AppLayout>
    </BrowserRouter>
  );
}
