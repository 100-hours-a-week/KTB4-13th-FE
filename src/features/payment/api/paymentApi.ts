import { parseApiResponse } from "@/common/api/apiResponse";
import { fetchWithAuth } from "@/features/auth/lib/httpClient";

interface CreatePaymentRequest {
  orderKey: string;
  useOwnedCouponId: number | null;
  usePoint: number;
}

type PaymentResult =
  | { ok: true }
  | { message: string | null; ok: false };

function failureMessage(error: { message: string } | null) {
  return error?.message?.trim() || null;
}

export async function createPayment(
  request: CreatePaymentRequest,
): Promise<PaymentResult> {
  try {
    const result = await parseApiResponse(
      await fetchWithAuth("/api/v1/payments", {
        body: JSON.stringify({
          orderKey: request.orderKey,
          ...(request.useOwnedCouponId !== null
            ? { useOwnedCouponId: request.useOwnedCouponId }
            : {}),
          ...(request.usePoint > 0 ? { usePoint: request.usePoint } : {}),
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      }),
    );
    if (!result.ok) return { message: failureMessage(result.error), ok: false };
    if (
      typeof result.data !== "object" ||
      result.data === null ||
      !Number.isSafeInteger(Reflect.get(result.data, "paymentId"))
    ) {
      return { message: null, ok: false };
    }
    return { ok: true };
  } catch {
    return { message: null, ok: false };
  }
}

export async function confirmPayment(
  orderKey: string,
  paymentKey: string,
  amount: number,
): Promise<PaymentResult> {
  const params = new URLSearchParams({ amount: String(amount), orderKey, paymentKey });
  try {
    const result = await parseApiResponse(
      await fetchWithAuth(`/api/v1/payments/callback/success?${params.toString()}`, {
        method: "POST",
      }),
    );
    return result.ok
      ? { ok: true }
      : { message: failureMessage(result.error), ok: false };
  } catch {
    return { message: null, ok: false };
  }
}

export async function reportPaymentFailure(
  orderKey: string,
  code: string,
  message: string,
): Promise<PaymentResult> {
  const params = new URLSearchParams({ code, message, orderKey });
  try {
    const result = await parseApiResponse(
      await fetchWithAuth(`/api/v1/payments/callback/fail?${params.toString()}`, {
        method: "POST",
      }),
    );
    return result.ok
      ? { ok: true }
      : { message: failureMessage(result.error), ok: false };
  } catch {
    return { message: null, ok: false };
  }
}
