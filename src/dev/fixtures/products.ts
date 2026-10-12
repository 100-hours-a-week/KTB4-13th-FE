import type { ProductDetail } from "@/features/product/types/product";

const baseProduct: ProductDetail = {
  author: "북적북적 테스트 저자",
  category: "소설",
  description: "실제 API나 DB와 무관한 개발 전용 도서입니다. 상품 상세 화면의 가격과 재고 상태를 점검하기 위해 사용합니다.",
  discountedPrice: 20000,
  itemName: "미리보기용 테스트 도서",
  productId: 1,
  publishedAt: "2026-01-01",
  publisher: "테스트 출판사",
  salePrice: 20000,
  stockQuantity: 10,
  thumbnailUrl: null,
};

export const productPreviewCases = {
  regular: {
    label: "일반",
    product: baseProduct,
  },
  discounted: {
    label: "할인",
    product: { ...baseProduct, discountedPrice: 16000 },
  },
  soldOut: {
    label: "품절",
    product: { ...baseProduct, discountedPrice: 16000, stockQuantity: 0 },
  },
} satisfies Record<string, { label: string; product: ProductDetail }>;

export type ProductPreviewCase = keyof typeof productPreviewCases;
