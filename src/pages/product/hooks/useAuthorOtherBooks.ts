import { useEffect, useState } from "react";

import type { ProductDetail } from "@/features/product/types/product";
import { fetchBookSearchResults } from "@/features/search/api/bookSearchApi";
import type { BookSearchItem } from "@/features/search/types/bookSearch";

function normalizeAuthor(author: string) {
  return author.trim().normalize("NFC").replace(/\s+/g, " ").toLocaleLowerCase("ko-KR");
}

export function useAuthorOtherBooks(product: ProductDetail) {
  const { author, itemName, productId } = product;
  const [result, setResult] = useState<{ productId: number; books: BookSearchItem[] } | null>(null);

  useEffect(() => {
    const authorQuery = author.trim();
    if (!authorQuery) return;
    const controller = new AbortController();

    void fetchBookSearchResults({
      cursor: null,
      priceMax: null,
      priceMin: null,
      pubYearFrom: null,
      pubYearTo: null,
      query: authorQuery,
      size: 20,
      sort: "popular",
    }, controller.signal).then((response) => {
      if (controller.signal.aborted || !response.ok) return;
      const authorKey = normalizeAuthor(authorQuery);
      const books = response.data.items.filter((book) =>
        book.productId !== productId &&
        book.title.trim().normalize("NFC") !== itemName.trim().normalize("NFC") &&
        book.author !== null && normalizeAuthor(book.author) === authorKey,
      ).slice(0, 3);
      setResult({ productId, books });
    });

    return () => controller.abort();
  }, [author, itemName, productId]);

  return result?.productId === productId ? result.books : [];
}
