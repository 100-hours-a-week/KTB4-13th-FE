// Mirrors backend ProductListResponse and ProductItemResponse, limited to fields the frontend reads.
// thumbnailUrl is nullable because products.thumbnail_url allows NULL.
export interface ProductListItem {
  itemId: number;
  itemName: string;
  thumbnailUrl: string | null;
}

export interface ProductListPage {
  items: ProductListItem[];
  nextCursor: string | null;
}

export interface ProductDetail {
  author: string;
  description: string | null;
  discountedPrice: number;
  itemName: string;
  productId: number;
  publishedAt: string;
  publisher: string;
  salePrice: number;
  stockQuantity: number;
  thumbnailUrl: string | null;
}
