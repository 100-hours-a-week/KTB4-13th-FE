export interface OrderedCartItem {
  productId: number;
  quantity: number;
}

const STORAGE_KEY = "bookjeok:ordered-cart-items";

function isOrderedCartItem(value: unknown): value is OrderedCartItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const productId = Reflect.get(value, "productId");
  const quantity = Reflect.get(value, "quantity");

  return (
    typeof productId === "number" &&
    Number.isSafeInteger(productId) &&
    productId > 0 &&
    typeof quantity === "number" &&
    Number.isSafeInteger(quantity) &&
    quantity > 0
  );
}

function readStoredItems() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every(isOrderedCartItem) ? parsed : [];
  } catch {
    return [];
  }
}

export function rememberOrderedCartItems(items: OrderedCartItem[]) {
  if (typeof window === "undefined" || items.length === 0) {
    return;
  }

  const quantities = new Map<number, number>();

  for (const item of [...readStoredItems(), ...items]) {
    quantities.set(
      item.productId,
      (quantities.get(item.productId) ?? 0) + item.quantity,
    );
  }

  window.sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      Array.from(quantities, ([productId, quantity]) => ({
        productId,
        quantity,
      })),
    ),
  );
}

export function takeOrderedCartItems() {
  const items = readStoredItems();

  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(STORAGE_KEY);
  }

  return items;
}
