import { useRef, useState } from "react";
import { Link } from "react-router-dom";

import { BottomNavigation } from "@/common/components/BottomNavigation";
import { RetryButton } from "@/common/components/RetryButton";
import { Toast } from "@/common/components/Toast";
import { useTransientNotice } from "@/common/hooks/useTransientNotice";
import {
  deleteUserAddress,
  setDefaultUserAddress,
} from "@/features/address/api/addressApi";
import {
  MAX_USER_ADDRESS_COUNT,
  useUserAddresses,
} from "@/features/address/hooks/useUserAddresses";
import type { UserAddress } from "@/features/address/types/address";
import { AddressPageHeader } from "@/pages/my-addresses/components/AddressPageHeader";
import { DeleteAddressDialog } from "@/pages/my-addresses/components/DeleteAddressDialog";
import { getAddressFailureMessage } from "@/pages/my-addresses/lib/addressFailureMessage";

const ADDRESS_LIMIT_NOTICE = `배송지는 최대 ${MAX_USER_ADDRESS_COUNT}개까지 등록할 수 있어요`;

const actionClassName =
  "inline-flex min-h-11 items-center rounded-control border border-border bg-surface px-3 type-caption font-semibold text-text-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50";

interface AddressListItemProps {
  address: UserAddress;
  isActionDisabled: boolean;
  isSettingDefault: boolean;
  onDeleteClick: (address: UserAddress) => void;
  onSetDefaultClick: (address: UserAddress) => void;
}

function AddressListItem({
  address,
  isActionDisabled,
  isSettingDefault,
  onDeleteClick,
  onSetDefaultClick,
}: AddressListItemProps) {
  return (
    <li className="py-5">
      <div className="flex min-w-0 items-center gap-2">
        <h2 className="min-w-0 break-words type-title text-text-primary">
          {address.label}
        </h2>
        {address.isDefault ? (
          <span className="shrink-0 rounded-control bg-primary px-1.5 py-0.5 type-caption font-semibold text-white">
            기본 배송지
          </span>
        ) : null}
      </div>
      <p className="mt-1 break-words type-body-small text-text-secondary">
        ({address.postalCode}) {address.address}
      </p>
      {address.detailAddress ? (
        <p className="break-words type-body-small text-text-secondary">
          {address.detailAddress}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          aria-label={`${address.label} 배송지 수정`}
          className={actionClassName}
          to={`/my/addresses/${address.addressId}/edit`}
        >
          수정
        </Link>
        {address.isDefault ? null : (
          <button
            aria-label={`${address.label} 배송지를 기본 배송지로 설정`}
            className={actionClassName}
            disabled={isActionDisabled}
            onClick={() => onSetDefaultClick(address)}
            type="button"
          >
            {isSettingDefault ? "설정 중" : "기본 배송지로 설정"}
          </button>
        )}
        <button
          aria-label={`${address.label} 배송지 삭제`}
          className={actionClassName}
          disabled={isActionDisabled}
          onClick={() => onDeleteClick(address)}
          type="button"
        >
          삭제
        </button>
      </div>
    </li>
  );
}

export function MyAddressesPage() {
  const { isReloading, reload, state } = useUserAddresses();
  const { notice, showNotice } = useTransientNotice();
  const [settingDefaultAddressId, setSettingDefaultAddressId] = useState<
    number | null
  >(null);
  const [deleteTarget, setDeleteTarget] = useState<UserAddress | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const listHeadingRef = useRef<HTMLParagraphElement>(null);
  const addresses = state.kind === "ready" ? state.addresses : [];
  const hasReachedLimit = addresses.length >= MAX_USER_ADDRESS_COUNT;
  const isActionDisabled =
    isReloading || isDeleting || settingDefaultAddressId !== null;

  const handleSetDefault = async (address: UserAddress) => {
    if (isActionDisabled) {
      return;
    }

    setSettingDefaultAddressId(address.addressId);
    const result = await setDefaultUserAddress(address.addressId);
    setSettingDefaultAddressId(null);

    if (result.ok) {
      showNotice("기본 배송지를 변경했어요");
      reload();
      return;
    }

    showNotice(getAddressFailureMessage(result.reason));
    if (result.reason === "not-found") {
      reload();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || isDeleting) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteUserAddress(deleteTarget.addressId);
    setIsDeleting(false);
    setDeleteTarget(null);

    if (result.ok) {
      showNotice("배송지를 삭제했어요");
      reload();
      return;
    }

    showNotice(getAddressFailureMessage(result.reason));
    if (result.reason === "not-found") {
      reload();
    }
  };

  return (
    <div className="relative flex h-dvh min-w-0 flex-col bg-surface">
      <AddressPageHeader fallbackPath="/my" title="배송지 관리" />

      <main className="page-content min-h-0 flex-1 overflow-y-auto py-6">
        <p
          className="type-body-small text-text-secondary"
          ref={listHeadingRef}
          tabIndex={-1}
        >
          등록된 배송지 {state.kind === "ready" ? addresses.length : "-"}/
          {MAX_USER_ADDRESS_COUNT}
        </p>

        {state.kind === "loading" ? (
          <div aria-busy="true" className="mt-4 space-y-3" role="status">
            <span className="sr-only">배송지를 불러오는 중이에요</span>
            <div aria-hidden="true" className="h-24 rounded-panel bg-muted" />
            <div aria-hidden="true" className="h-24 rounded-panel bg-muted" />
          </div>
        ) : null}

        {state.kind === "error" ? (
          <div className="mt-4">
            <Toast action={<RetryButton onClick={reload} />} variant="error">
              배송지를 불러오지 못했어요
            </Toast>
          </div>
        ) : null}

        {state.kind === "ready" && addresses.length === 0 ? (
          <div className="mt-10 text-center">
            <p className="type-title text-text-primary">등록된 배송지가 없어요</p>
            <p className="mt-1 type-body-small text-text-secondary">
              자주 쓰는 배송지를 추가해 두세요
            </p>
          </div>
        ) : null}

        {addresses.length > 0 ? (
          <ul className="mt-2 divide-y divide-border border-b border-border">
            {addresses.map((address) => (
              <AddressListItem
                address={address}
                isActionDisabled={isActionDisabled}
                isSettingDefault={settingDefaultAddressId === address.addressId}
                key={address.addressId}
                onDeleteClick={setDeleteTarget}
                onSetDefaultClick={(target) => void handleSetDefault(target)}
              />
            ))}
          </ul>
        ) : null}

        {state.kind === "ready" ? (
          <div className="mt-6">
            {hasReachedLimit ? (
              <>
                <button
                  aria-describedby="address-limit-notice"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-control border border-border bg-surface px-4 type-body-small font-semibold text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
                  disabled
                  type="button"
                >
                  배송지 추가
                </button>
                <p
                  className="mt-2 text-center type-caption text-text-secondary"
                  id="address-limit-notice"
                >
                  {ADDRESS_LIMIT_NOTICE}
                </p>
              </>
            ) : (
              <Link
                className="inline-flex min-h-12 w-full items-center justify-center rounded-control border border-border bg-surface px-4 type-body-small font-semibold text-text-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                to="/my/addresses/new"
              >
                + 배송지 추가
              </Link>
            )}
          </div>
        ) : null}
      </main>

      {notice ? (
        <div className="page-content pointer-events-none absolute inset-x-0 bottom-20">
          <Toast>{notice}</Toast>
        </div>
      ) : null}

      <BottomNavigation />

      <DeleteAddressDialog
        addressLabel={deleteTarget?.label ?? ""}
        fallbackFocusRef={listHeadingRef}
        isOpen={deleteTarget !== null}
        isSubmitting={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleDeleteConfirm()}
      />
    </div>
  );
}
