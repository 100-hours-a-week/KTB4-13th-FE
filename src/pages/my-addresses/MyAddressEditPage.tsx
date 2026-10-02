import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { RetryButton } from "@/common/components/RetryButton";
import { Toast } from "@/common/components/Toast";
import { useTransientNotice } from "@/common/hooks/useTransientNotice";
import { updateUserAddress } from "@/features/address/api/addressApi";
import { useUserAddresses } from "@/features/address/hooks/useUserAddresses";
import type { UserAddress } from "@/features/address/types/address";
import { AddressForm } from "@/pages/my-addresses/components/AddressForm";
import type { AddressFormValues } from "@/pages/my-addresses/components/AddressForm";
import { AddressPageHeader } from "@/pages/my-addresses/components/AddressPageHeader";
import { getAddressFailureMessage } from "@/pages/my-addresses/lib/addressFailureMessage";
import { useReturnToAddressList } from "@/pages/my-addresses/hooks/useReturnToAddressList";

function parseAddressId(addressIdParam: string | undefined) {
  const addressId = Number(addressIdParam);
  return Number.isSafeInteger(addressId) && addressId > 0 ? addressId : null;
}

function toAddressFormValues(address: UserAddress): AddressFormValues {
  return {
    address: address.address,
    detailAddress: address.detailAddress ?? "",
    isDefault: address.isDefault,
    label: address.label,
    postalCode: address.postalCode,
  };
}

// No single-address API exists, so the page reads the list and finds the address; direct visits work the same way.
export function MyAddressEditPage() {
  const { addressId: addressIdParam } = useParams();
  const addressId = parseAddressId(addressIdParam);
  const { reload, state } = useUserAddresses();
  const { notice, showNotice } = useTransientNotice();
  const returnToAddressList = useReturnToAddressList();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editingAddress =
    state.kind === "ready"
      ? (state.addresses.find((address) => address.addressId === addressId) ?? null)
      : null;

  const handleSubmit = async (values: AddressFormValues) => {
    if (!editingAddress) {
      return;
    }

    setIsSubmitting(true);
    const result = await updateUserAddress(editingAddress.addressId, {
      address: values.address.trim(),
      detailAddress: values.detailAddress.trim() || null,
      label: values.label.trim(),
      postalCode: values.postalCode.trim(),
    });
    setIsSubmitting(false);

    if (result.ok) {
      returnToAddressList();
      return;
    }

    showNotice(getAddressFailureMessage(result.reason));
    if (result.reason === "not-found") {
      reload();
    }
  };

  return (
    <div className="relative flex h-dvh min-w-0 flex-col bg-surface">
      <AddressPageHeader fallbackPath="/my/addresses" title="배송지 수정" />

      {state.kind === "loading" ? (
        <div aria-busy="true" className="page-content py-6" role="status">
          <span className="sr-only">배송지 정보를 불러오는 중이에요</span>
          <div aria-hidden="true" className="h-40 rounded-control bg-muted" />
        </div>
      ) : null}

      {state.kind === "error" ? (
        <div className="page-content py-6">
          <Toast action={<RetryButton onClick={reload} />} variant="error">
            배송지 정보를 불러오지 못했어요
          </Toast>
        </div>
      ) : null}

      {state.kind === "ready" && !editingAddress ? (
        <div className="page-content py-10 text-center">
          <p className="type-title text-text-primary">배송지를 찾을 수 없어요</p>
          <p className="mt-1 type-body-small text-text-secondary">
            이미 삭제되었거나 존재하지 않는 배송지예요
          </p>
          <Link
            className="mt-6 inline-flex min-h-11 items-center rounded-control border border-border-strong px-4 type-body-small font-semibold text-text-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            replace
            to="/my/addresses"
          >
            배송지 목록으로
          </Link>
        </div>
      ) : null}

      {editingAddress ? (
        <AddressForm
          defaultAddressOption="hidden"
          initialValues={toAddressFormValues(editingAddress)}
          isSubmitting={isSubmitting}
          key={editingAddress.addressId}
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
