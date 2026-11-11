import { useEffect, useState, type RefObject } from "react";

import { normalizeAuthor, normalizeTitle } from "@/common/lib/authorName";
import type { ProductDetail } from "@/features/product/types/product";
import { fetchBookSearchResults } from "@/features/search/api/bookSearchApi";
import type { BookSearchItem } from "@/features/search/types/bookSearch";

interface AuthorBooksResult {
  productId: number;
  books: BookSearchItem[];
  status: "idle" | "loading" | "ready" | "error";
}

export function useAuthorOtherBooks(product: ProductDetail, sectionRef: RefObject<HTMLDivElement | null>) {
  const { author, itemName, productId } = product;
  const [result, setResult] = useState<AuthorBooksResult | null>(null);
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    const authorQuery = author.trim();
    const section = sectionRef.current;
    if (!authorQuery || !section) return;
    const controller = new AbortController();
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      setResult({ productId, books: [], status: "loading" });

      void fetchBookSearchResults({
        category: null,
        cursor: null,
        priceMax: null,
        priceMin: null,
        pubYearFrom: null,
        pubYearTo: null,
        query: authorQuery,
        size: 20,
        sort: "popular",
      }, controller.signal).then((response) => {
        if (controller.signal.aborted) return;
        if (!response.ok) {
          setResult({ productId, books: [], status: "error" });
          return;
        }
        const authorKey = normalizeAuthor(authorQuery);
        const books = response.data.items.filter((book) =>
          book.productId !== productId &&
          normalizeTitle(book.title) !== normalizeTitle(itemName) &&
          book.author !== null && normalizeAuthor(book.author) === authorKey,
        ).slice(0, 3);
        setResult({ productId, books, status: "ready" });
      });
    }, { rootMargin: "160px" });
    observer.observe(section);

    return () => {
      observer.disconnect();
      controller.abort();
    };
  }, [author, itemName, productId, requestKey, sectionRef]);

  const state: AuthorBooksResult = result?.productId === productId
    ? result
    : { productId, books: [], status: "idle" };

  return { ...state, retry: () => setRequestKey((current) => current + 1) };
}
