export interface ProductReview {
  content: string;
  id: number;
  isMyReview: boolean;
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

export interface UpdateProductReviewRequest {
  content: string;
  isSpoiler: boolean;
  rate: number;
}
