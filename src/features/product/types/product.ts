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
