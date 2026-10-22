// Mirrors backend ProductListResponse and ProductItemResponse, limited to fields the frontend reads.
// thumbnailUrl and discountedPrice are nullable in the product contract.
export interface ProductListItem {
  author: string;
  discountedPrice: number | null;
  itemId: number;
  itemName: string;
  reviewCount?: number;
  reviewRate?: number;
  salePrice: number;
  thumbnailUrl: string | null;
}

export interface ProductListPage {
  items: ProductListItem[];
  nextCursor: string | null;
}

export interface ProductDetail {
  author: string;
  category: string;
  couponIds: number[];
  description: string | null;
  discountedPrice: number;
  itemName: string;
  productId: number;
  publishedAt: string;
  publisher: string;
  reviewCount: number;
  reviewRate: number;
  salePrice: number;
  stockQuantity: number;
  thumbnailUrl: string | null;
}

export interface ProductCategory {
  id: number;
  name: string;
  path: string;
}
