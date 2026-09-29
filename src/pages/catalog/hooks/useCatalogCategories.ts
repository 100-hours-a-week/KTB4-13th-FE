import { useEffect, useState } from "react";

import { fetchProductCategories } from "@/features/product/api/productCategoryApi";
import type { ProductCategory } from "@/features/product/types/product";

export type CategoryState =
  | { kind: "loading" }
  | { categories: ProductCategory[]; kind: "ready" }
  | { kind: "error" };

export function useCatalogCategories() {
  const [state, setState] = useState<CategoryState>({ kind: "loading" });
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    void fetchProductCategories().then((categories) => {
      if (!isActive) {
        return;
      }

      setState(
        categories === null ? { kind: "error" } : { categories, kind: "ready" },
      );
    });

    return () => {
      isActive = false;
    };
  }, [requestKey]);

  const retry = () => {
    setState({ kind: "loading" });
    setRequestKey((current) => current + 1);
  };

  return { categoryState: state, retryCategories: retry };
}
