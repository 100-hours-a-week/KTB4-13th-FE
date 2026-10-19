import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { ArrowLeftIcon } from "@/common/components/AppIcons";
import { Button } from "@/common/components/Button";
import { Toast } from "@/common/components/Toast";
import { useTransientNotice } from "@/common/hooks/useTransientNotice";
import { registerUserAddress } from "@/features/address/api/addressApi";
import { createOrder } from "@/features/order/api/orderApi";
import {
  readOrderNavigationState,
  toCreateOrderItems,
} from "@/features/order/lib/orderNavigation";
import type { OwnedCoupon } from "@/features/benefit/types/benefit";
import { AddressSection } from "@/pages/order/components/AddressSection";
import { OrderItemsSection } from "@/pages/order/components/OrderItemsSection";
import {
  PaymentMethodSection,
  PaymentSummary,
  BenefitSection,
} from "@/pages/order/components/PaymentDetails";
import { useAddresses } from "@/pages/order/hooks/useAddresses";
import { useOrderBenefits } from "@/pages/order/hooks/useOrderBenefits";
import {
  EMPTY_DELIVERY_FORM,
  validateDeliveryForm,
} from "@/pages/order/lib/orderForm";
import type {
  DeliveryFormErrors,
  DeliveryFormField,
  DeliveryFormValues,
  DeliveryMode,
} from "@/pages/order/lib/orderForm";
import {
  calculateOrderTotals,
  formatWon,
} from "@/pages/order/lib/orderTotals";

const ORDER_ADDRESS_REQUIRED_NOTICE =
  "주문을 완료하려면 배송지 입력이 필요해요. 배송지를 입력해 주세요";
const ORDER_STOCK_NOTICE = "재고가 부족한 상품이 있어 주문하지 못했어요";
const ORDER_FAILURE_NOTICE = "주문하지 못했어요. 다시 시도해 주세요";
const POSTCODE_ERROR_NOTICE =
  "주소 검색을 불러오지 못했어요. 다시 시도해 주세요.";

export function OrderPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { notice, showNotice } = useTransientNotice();
  const { retry, state: addressesState } = useAddresses();
  const navigationState = readOrderNavigationState(location.state);
  const items = navigationState?.items ?? [];
  const cartItemIds = navigationState?.cartItemIds ?? [];
  const benefits = useOrderBenefits();
  const [selectedCouponId, setSelectedCouponId] = useState<number | null>(null);
  const [pointAmount, setPointAmount] = useState(0);
  const selectedCoupon = benefits.state.kind === "ready"
    ? benefits.state.coupons.find((coupon) => coupon.id === selectedCouponId) ?? null
    : null;
  const subtotal = calculateOrderTotals(items).subtotal;
  const couponDiscount = getCouponDiscount(selectedCoupon, subtotal);
  const appliedPoint = Math.min(pointAmount, Math.max(0, subtotal - couponDiscount));
  const totals = calculateOrderTotals(items, couponDiscount, appliedPoint);
  const defaultAddress =
    addressesState.kind === "ready"
      ? (addressesState.addresses.find((address) => address.isDefault) ?? null)
      : null;
  const [selectedMode, setSelectedMode] =
    useState<DeliveryMode>("default");
  const mode = defaultAddress ? selectedMode : "new";
  const [formValues, setFormValues] = useState<DeliveryFormValues>(
    EMPTY_DELIVERY_FORM,
  );
  const [formErrors, setFormErrors] = useState<DeliveryFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentErrors = validateDeliveryForm(mode, formValues);
  const isAddressReady = addressesState.kind === "ready";
  const canSubmit =
    isAddressReady &&
    !isSubmitting &&
    items.length > 0 &&
    Object.keys(currentErrors).length === 0;

  const handleBack = () => {
    if (location.key === "default") {
      navigate("/", { replace: true });
      return;
    }

    navigate(-1);
  };

  const handleFieldChange = (field: DeliveryFormField, value: string) => {
    setFormValues((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => {
      if (!current[field]) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleFieldBlur = (field: DeliveryFormField) => {
    const error = validateDeliveryForm(mode, formValues)[field];

    setFormErrors((current) => {
      if (error) {
        return { ...current, [field]: error };
      }
      if (!current[field]) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async () => {
    if (isSubmitting || items.length === 0) {
      return;
    }

    const errors = validateDeliveryForm(mode, formValues);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    if (mode === "new") {
      const addressResult = await registerUserAddress({
        address: formValues.address.trim(),
        detailAddress: formValues.detailAddress.trim() || null,
        isDefault: true,
        label: formValues.label.trim(),
        postalCode: formValues.postalCode.trim(),
      });

      if (!addressResult.ok) {
        setIsSubmitting(false);
        showNotice(
          addressResult.reason === "invalid-request"
            ? "배송지를 등록하지 못했어요. 중복 주소나 등록 한도를 확인해 주세요"
            : "배송지를 저장하지 못했어요. 다시 시도해 주세요",
        );
        return;
      }
    }

    const result = await createOrder({
      items: toCreateOrderItems(items),
    });

    if (!result.ok) {
      setIsSubmitting(false);
      showNotice(
        result.reason === "stock" ? ORDER_STOCK_NOTICE : ORDER_FAILURE_NOTICE,
      );
      return;
    }

    if (result.data.status === "ORDER_CREATED") {
      const searchParams = new URLSearchParams({ orderKey: result.data.orderKey });
      if (selectedCouponId !== null) searchParams.set("couponId", String(selectedCouponId));
      if (appliedPoint > 0) searchParams.set("point", String(appliedPoint));
      if (cartItemIds.length > 0) searchParams.set("cartItemIds", cartItemIds.join(","));
      navigate(`/payment?${searchParams.toString()}`, { replace: true });
      return;
    }

    setIsSubmitting(false);
    setFormErrors(validateDeliveryForm("new", formValues));
    showNotice(ORDER_ADDRESS_REQUIRED_NOTICE);
    retry();
  };

  return (
    <div className="relative flex h-dvh min-w-0 flex-col bg-surface">
      <header className="page-content grid min-h-16 shrink-0 grid-cols-[2.75rem_1fr_2.75rem] items-center bg-surface">
        <button
          aria-label="이전 화면으로 돌아가기"
          className="-ml-2 inline-flex size-11 items-center justify-center rounded-full text-text-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={handleBack}
          type="button"
        >
          <ArrowLeftIcon className="size-6" />
        </button>
        <h1 className="text-center type-title text-text-primary">주문/결제</h1>
        <span aria-hidden="true" />
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="page-content flex flex-col divide-y divide-hairline pb-6 [&>*]:py-8 [&>*:first-child]:pt-4">
          <AddressSection
            defaultAddress={defaultAddress}
            errors={formErrors}
            mode={mode}
            onChange={handleFieldChange}
            onFieldBlur={handleFieldBlur}
            onModeChange={setSelectedMode}
            onPostcodeError={() => showNotice(POSTCODE_ERROR_NOTICE)}
            onRetry={retry}
            state={addressesState}
            values={formValues}
          />
          <OrderItemsSection items={items} />
          <BenefitSection
            onPointChange={setPointAmount}
            onRetry={benefits.retry}
            onSelectCoupon={setSelectedCouponId}
            pointAmount={appliedPoint}
            selectedCouponId={selectedCouponId}
            state={benefits.state}
            subtotal={subtotal}
          />
          <PaymentMethodSection />
          <PaymentSummary totals={totals} />
        </div>
      </main>

      {notice ? (
        <div className="page-content pointer-events-none absolute inset-x-0 bottom-24 z-10">
          <Toast variant="error">{notice}</Toast>
        </div>
      ) : null}

      <div className="safe-area-bottom shrink-0 border-t border-hairline bg-surface px-5 pt-3">
        <Button
          className="min-h-12 w-full"
          disabled={!canSubmit}
          onClick={() => {
            void handleSubmit();
          }}
        >
          {formatWon(totals.total)} 주문 만들기
        </Button>
      </div>
    </div>
  );
}

function getCouponDiscount(coupon: OwnedCoupon | null, subtotal: number) {
  if (!coupon || coupon.state !== "ISSUED" || subtotal < coupon.minOrderAmount) return 0;
  if (coupon.type === "FIXED_AMOUNT") return coupon.discount;
  if (coupon.type === "PERCENT_RATE") return subtotal * coupon.discount;
  return 0;
}
