import { useState } from "react";
import { Link } from "react-router-dom";

import { RetryButton } from "@/common/components/RetryButton";
import { Toast } from "@/common/components/Toast";
import { useTransientNotice } from "@/common/hooks/useTransientNotice";
import { registerUserAddress } from "@/features/address/api/addressApi";
import {
  MAX_USER_ADDRESS_COUNT,
  useUserAddresses,
} from "@/features/address/hooks/useUserAddresses";
import { AddressForm } from "@/pages/my-addresses/components/AddressForm";
import type { AddressFormValues } from "@/pages/my-addresses/components/AddressForm";
import { AddressPageHeader } from "@/pages/my-addresses/components/AddressPageHeader";
import { getAddressFailureMessage } from "@/pages/my-addresses/lib/addressFailureMessage";
import { useReturnToAddressList } from "@/pages/my-addresses/hooks/useReturnToAddressList";

const EMPTY_ADDRESS_FORM: AddressFormValues = {
  address: "",
  detailAddress: "",
  isDefault: false,
  label: "",
  postalCode: "",
};

export function MyAddressCreatePage() {
  const { reload, state } = useUserAddresses();
  const { notice, showNotice } = useTransientNotice();
  const returnToAddressList = useReturnToAddressList();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addressCount = state.kind === "ready" ? state.addresses.length : 0;
  const isFirstAddress = addressCount === 0;

  const handleSubmit = async (values: AddressFormValues) => {
    setIsSubmitting(true);
    const result = await registerUserAddress({
      address: values.address.trim(),
      detailAddress: values.detailAddress.trim() || null,
      isDefault: isFirstAddress || values.isDefault,
      label: values.label.trim(),
      postalCode: values.postalCode.trim(),
    });
    setIsSubmitting(false);

    if (result.ok) {
      returnToAddressList();
      return;
    }

    showNotice(getAddressFailureMessage(result.reason));
  };

  return (
    <div className="relative flex h-dvh min-w-0 flex-col bg-surface">
      <AddressPageHeader fallbackPath="/my/addresses" title="배송지 추가" />

      {state.kind === "loading" ? (
        <div aria-busy="true" className="page-content py-6" role="status">
          <span className="sr-only">배송지 정보를 불러오는 중이에요</span>
          <div aria-hidden="true" className="h-40 rounded-panel bg-muted" />
        </div>
      ) : null}

      {state.kind === "error" ? (
        <div className="page-content py-6">
          <Toast action={<RetryButton onClick={reload} />} variant="error">
            배송지 정보를 불러오지 못했어요
          </Toast>
        </div>
      ) : null}

      {state.kind === "ready" && addressCount >= MAX_USER_ADDRESS_COUNT ? (
        <div className="page-content py-10 text-center">
          <p className="type-title text-text-primary">
            배송지는 최대 {MAX_USER_ADDRESS_COUNT}개까지 등록할 수 있어요
          </p>
          <p className="mt-1 type-body-small text-text-secondary">
            사용하지 않는 배송지를 삭제한 뒤 다시 추가해 주세요
          </p>
          <Link
            className="mt-6 inline-flex min-h-11 items-center rounded-control border border-border px-4 type-body-small font-semibold text-text-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            replace
            to="/my/addresses"
          >
            배송지 목록으로
          </Link>
        </div>
      ) : null}

      {state.kind === "ready" && addressCount < MAX_USER_ADDRESS_COUNT ? (
        <AddressForm
          defaultAddressOption={isFirstAddress ? "first-address" : "selectable"}
          initialValues={EMPTY_ADDRESS_FORM}
          isSubmitting={isSubmitting}
          onSubmit={(values) => void handleSubmit(values)}
          submitLabel="저장"
        />
      ) : null}

      {notice ? (
        <div className="page-content pointer-events-none absolute inset-x-0 bottom-24 z-10">
          <Toast variant="error">{notice}</Toast>
        </div>
      ) : null}
    </div>
  );
}
