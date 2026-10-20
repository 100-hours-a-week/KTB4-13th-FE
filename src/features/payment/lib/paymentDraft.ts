export interface PaymentDraft {
  amount: number;
  cartItemIds: number[];
  couponDiscount: number;
  couponId: number | null;
  isPrepared: boolean;
  point: number;
}

const STORAGE_PREFIX = "bookjeok:payment-draft:";

function storageKey(orderKey: string) {
  return `${STORAGE_PREFIX}${orderKey}`;
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export function readPaymentDraft(orderKey: string): PaymentDraft | null {
  try {
    const raw = window.sessionStorage.getItem(storageKey(orderKey));
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (
      typeof value !== "object" ||
      value === null ||
      !isNonNegativeNumber(Reflect.get(value, "amount")) ||
      !isNonNegativeNumber(Reflect.get(value, "couponDiscount")) ||
      !isNonNegativeNumber(Reflect.get(value, "point")) ||
      (Reflect.get(value, "couponId") !== null &&
        !Number.isSafeInteger(Reflect.get(value, "couponId"))) ||
      typeof Reflect.get(value, "isPrepared") !== "boolean" ||
      !Array.isArray(Reflect.get(value, "cartItemIds")) ||
      !(Reflect.get(value, "cartItemIds") as unknown[]).every(
        (id) => Number.isSafeInteger(id) && Number(id) > 0,
      )
    ) {
      return null;
    }
    return value as PaymentDraft;
  } catch {
    return null;
  }
}

export function savePaymentDraft(orderKey: string, draft: PaymentDraft) {
  window.sessionStorage.setItem(storageKey(orderKey), JSON.stringify(draft));
}

export function clearPaymentDraft(orderKey: string) {
  window.sessionStorage.removeItem(storageKey(orderKey));
}
