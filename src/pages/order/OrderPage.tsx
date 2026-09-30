import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { ArrowLeftIcon } from "@/common/components/AppIcons";
import { Button } from "@/common/components/Button";
import { Toast } from "@/common/components/Toast";
import { useTransientNotice } from "@/common/hooks/useTransientNotice";
import { createOrder } from "@/features/order/api/orderApi";
import {
  readOrderNavigationState,
  toCreateOrderItems,
} from "@/features/order/lib/orderNavigation";
import { AddressSection } from "@/pages/order/components/AddressSection";
import { OrderItemsSection } from "@/pages/order/components/OrderItemsSection";
import {
  PaymentMethodSection,
  PaymentSummary,
} from "@/pages/order/components/PaymentDetails";
import { useAddresses } from "@/pages/order/hooks/useAddresses";
import {
  EMPTY_DELIVERY_FORM,
  getEffectiveDeliveryValues,
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

const ORDER_UNAVAILABLE_NOTICE =
  "현재 주문을 진행할 수 없어요. 잠시 후 다시 시도해 주세요";
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
  const totals = calculateOrderTotals(items);
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
  const effectiveValues = getEffectiveDeliveryValues(
    mode,
    formValues,
    defaultAddress,
  );
  const currentErrors = validateDeliveryForm(effectiveValues);
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
    const error = validateDeliveryForm(effectiveValues)[field];

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
    const errors = validateDeliveryForm(effectiveValues);
    setFormErrors(errors);

    if (isSubmitting || items.length === 0 || Object.keys(errors).length > 0) {
      return;
    }

    // POST /api/v1/orders needs a saved addressId; a new address cannot be registered and identified yet.
    if (mode !== "default" || !defaultAddress) {
      showNotice(ORDER_UNAVAILABLE_NOTICE);
      return;
    }

    setIsSubmitting(true);
    const result = await createOrder({
      addressId: defaultAddress.addressId,
      items: toCreateOrderItems(items),
    });
    setIsSubmitting(false);

    if (result.ok) {
      navigate("/order/complete", { replace: true });
      return;
    }

    showNotice(result.reason === "stock" ? ORDER_STOCK_NOTICE : ORDER_FAILURE_NOTICE);
  };

  return (
    <div className="relative flex h-dvh min-w-0 flex-col bg-surface">
      <header className="page-content grid min-h-16 shrink-0 grid-cols-[2.75rem_1fr_2.75rem] items-center border-b border-border bg-surface">
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
        <div className="page-content space-y-8 py-6 pb-10">
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
          <PaymentMethodSection />
          <PaymentSummary totals={totals} />
        </div>
      </main>

      {notice ? (
        <div className="page-content pointer-events-none absolute inset-x-0 bottom-24 z-10">
          <Toast variant="error">{notice}</Toast>
        </div>
      ) : null}

      <div className="safe-area-bottom shrink-0 border-t border-border bg-surface px-5 pt-3">
        <Button
          className="min-h-12 w-full"
          disabled={!canSubmit}
          onClick={() => {
            void handleSubmit();
          }}
        >
          {formatWon(totals.total)} 결제하기
        </Button>
      </div>
    </div>
  );
}
