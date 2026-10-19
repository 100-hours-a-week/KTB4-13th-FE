export interface ProductReview {
  content: string;
  id: number;
  isSpoiler: boolean;
  productId: number;
  rate: number;
}

export interface ProductReviewPage {
  hasNext: boolean;
  reviews: ProductReview[];
}

export interface CreateProductReviewRequest {
  content: string;
  isSpoiler: boolean;
  productId: number;
  rate: number;
}
