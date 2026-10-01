import type { ProductListItem } from "@/features/product/types/product";
import type { RecommendationFeedItem } from "@/features/recommendation/types/recommendationFeed";
import type { CatalogBookItem } from "@/pages/catalog/types/catalog";

export function toRankingBookItem(product: ProductListItem): CatalogBookItem {
  const hasDiscount =
    product.discountedPrice !== null &&
    product.discountedPrice !== product.salePrice;

  return {
    author: product.author,
    key: `product-${product.itemId}`,
    matchScore: null,
    originalPrice: hasDiscount ? product.salePrice : null,
    price: hasDiscount ? product.discountedPrice : product.salePrice,
    productId: product.itemId,
    thumbnailUrl: product.thumbnailUrl,
    title: product.itemName,
  };
}

export function toRecommendationBookItem(
  book: RecommendationFeedItem,
): CatalogBookItem {
  return {
    author: book.author,
    key: `book-${book.bookId}`,
    matchScore: book.matchScore,
    originalPrice: null,
    price: book.price,
    productId: book.productId,
    thumbnailUrl: book.coverUrl,
    title: book.title,
  };
}
