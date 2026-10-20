const TOSS_SDK_URL = "https://js.tosspayments.com/v2/standard";
let sdkPromise: Promise<void> | null = null;

interface TossPaymentWindow {
  requestPayment: (request: {
    amount: { currency: "KRW"; value: number };
    failUrl: string;
    method: "CARD";
    orderId: string;
    orderName: string;
    successUrl: string;
  }) => Promise<void>;
}

interface TossPaymentsInstance {
  payment: (options: { customerKey: string }) => TossPaymentWindow;
}

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => TossPaymentsInstance;
  }
}

function loadSdk() {
  if (window.TossPayments) return Promise.resolve();
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${TOSS_SDK_URL}"]`,
    );
    const script = existing ?? document.createElement("script");
    const handleLoad = () => window.TossPayments ? resolve() : reject(new Error("Toss SDK unavailable"));
    const handleError = () => reject(new Error("Toss SDK load failed"));
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    if (!existing) {
      script.src = TOSS_SDK_URL;
      document.head.append(script);
    }
  }).catch((error: unknown) => {
    sdkPromise = null;
    throw error;
  });
  return sdkPromise;
}

export function getTossClientKey() {
  return import.meta.env.VITE_TOSS_CLIENT_KEY?.trim() ?? "";
}

export async function requestTossPayment(request: {
  amount: number;
  orderKey: string;
  orderName: string;
}) {
  const clientKey = getTossClientKey();
  if (!clientKey) throw new Error("Toss client key is not configured");
  await loadSdk();
  const tossPayments = window.TossPayments;
  if (!tossPayments) throw new Error("Toss SDK unavailable");
  const origin = window.location.origin;
  await tossPayments(clientKey).payment({ customerKey: request.orderKey }).requestPayment({
    amount: { currency: "KRW", value: request.amount },
    failUrl: `${origin}/payment/fail`,
    method: "CARD",
    orderId: request.orderKey,
    orderName: request.orderName.slice(0, 100),
    successUrl: `${origin}/payment/success`,
  });
}
