import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { ArrowLeftIcon } from "@/common/components/AppIcons";
import { BottomNavigation } from "@/common/components/BottomNavigation";
import { Button } from "@/common/components/Button";
import { RetryButton } from "@/common/components/RetryButton";
import { Toast } from "@/common/components/Toast";
import { useTransientNotice } from "@/common/hooks/useTransientNotice";
import { CartItemRow } from "@/pages/cart/components/CartItemRow";
import { CartSummary } from "@/pages/cart/components/CartSummary";
import { DeleteCartItemsDialog } from "@/pages/cart/components/DeleteCartItemsDialog";
import { useCart } from "@/pages/cart/hooks/useCart";
import { useCartSelection } from "@/pages/cart/hooks/useCartSelection";
import { calculateCartTotals } from "@/pages/cart/lib/cartTotals";

const UNAVAILABLE_NOTICE = "아직 준비 중인 기능이에요";

type DeleteTarget =
  | { cartItemIds: number[]; kind: "selection" }
  | { cartItemIds: [number]; kind: "single" };

interface SelectionToolbarProps {
  isAllSelected: boolean;
  isDeleteDisabled: boolean;
  onDelete: () => void;
  onToggleAll: () => void;
  selectableCount: number;
  selectedCount: number;
}

function SelectionToolbar({
  isAllSelected,
  isDeleteDisabled,
  onDelete,
  onToggleAll,
  selectableCount,
  selectedCount,
}: SelectionToolbarProps) {
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate =
        selectedCount > 0 && !isAllSelected;
    }
  }, [isAllSelected, selectedCount]);

  return (
    <section
      aria-label="장바구니 상품 선택"
      className="flex items-center justify-between gap-4 rounded-panel border border-border bg-surface p-4"
    >
      <label className="flex min-h-11 items-center gap-3 type-body-small font-medium text-text-primary">
        <input
          checked={isAllSelected}
          className="size-5 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          disabled={selectableCount === 0}
          onChange={onToggleAll}
          ref={checkboxRef}
          type="checkbox"
        />
        전체 선택 ({selectableCount})
      </label>
      <Button
        disabled={selectedCount === 0 || isDeleteDisabled}
        onClick={onDelete}
        variant="secondary"
      >
        선택 삭제
      </Button>
    </section>
  );
}

function CartLoadingState() {
  return (
    <div aria-busy="true" className="space-y-4 py-6">
      <p className="sr-only" role="status">
        장바구니를 불러오는 중이에요
      </p>
      <div aria-hidden="true" className="h-20 rounded-panel bg-muted" />
      {Array.from({ length: 2 }, (_, index) => (
        <div
          aria-hidden="true"
          className="h-40 rounded-panel bg-muted"
          key={index}
        />
      ))}
    </div>
  );
}

export function CartPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { notice, showNotice } = useTransientNotice();
  const {
    changeQuantity,
    isDeleting,
    isMutating,
    removeItem,
    removeItems,
    retry,
    state,
    updatingCartItemId,
  } = useCart();
  const items = state.kind === "ready" ? state.items : [];
  const selection = useCartSelection(items, state.kind === "ready");
  const totals = calculateCartTotals(items, selection.selectedIds);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const handleBack = () => {
    if (location.key === "default") {
      navigate("/", { replace: true });
      return;
    }
    navigate(-1);
  };

  const handleQuantityChange = async (
    cartItemId: number,
    quantity: number,
  ) => {
    const isSuccess = await changeQuantity(cartItemId, quantity);
    if (!isSuccess) {
      showNotice("수량을 변경하지 못했어요. 다시 시도해 주세요");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || deleteTarget.cartItemIds.length === 0) {
      return;
    }

    const isSuccess =
      deleteTarget.kind === "single"
        ? await removeItem(deleteTarget.cartItemIds[0])
        : await removeItems(deleteTarget.cartItemIds);
    setDeleteTarget(null);

    if (!isSuccess) {
      showNotice("상품을 삭제하지 못했어요. 다시 시도해 주세요");
    }
  };

  const handleOrder = () => {
    if (selection.selectedCount === 0) {
      return;
    }
    showNotice("주문 화면을 준비하고 있어요");
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
        <h1
          className="text-center type-title text-text-primary"
          ref={headingRef}
          tabIndex={-1}
        >
          장바구니
        </h1>
        <span aria-hidden="true" />
      </header>

      <main className="page-content min-h-0 flex-1 overflow-y-auto">
        {state.kind === "loading" ? <CartLoadingState /> : null}

        {state.kind === "error" ? (
          <div className="py-6">
            <Toast action={<RetryButton onClick={retry} />} variant="error">
              장바구니를 불러오지 못했어요
            </Toast>
          </div>
        ) : null}

        {state.kind === "ready" && items.length === 0 ? (
          <section className="flex min-h-full flex-col items-center justify-center gap-2 py-12 text-center">
            <h2 className="type-title text-text-primary">
              장바구니가 비어 있어요
            </h2>
            <p className="type-body-small text-text-secondary">
              마음에 드는 책을 찾아 장바구니에 담아보세요
            </p>
            <Button className="mt-4" onClick={() => navigate("/")}>
              책 추천받기
            </Button>
          </section>
        ) : null}

        {state.kind === "ready" && items.length > 0 ? (
          <div className="space-y-4 py-6">
            <SelectionToolbar
              isAllSelected={selection.isAllSelected}
              isDeleteDisabled={isMutating}
              onDelete={() =>
                setDeleteTarget({
                  cartItemIds: Array.from(selection.selectedIds),
                  kind: "selection",
                })
              }
              onToggleAll={selection.toggleAll}
              selectableCount={selection.selectableCount}
              selectedCount={selection.selectedCount}
            />

            <ul className="space-y-3">
              {items.map((item) => (
                <CartItemRow
                  isDeleteDisabled={isMutating}
                  isQuantityDisabled={isMutating}
                  isSelected={selection.selectedIds.has(item.cartItemId)}
                  isUpdating={updatingCartItemId === item.cartItemId}
                  item={item}
                  key={item.cartItemId}
                  onDelete={(cartItemId) =>
                    setDeleteTarget({ cartItemIds: [cartItemId], kind: "single" })
                  }
                  onQuantityChange={(cartItemId, quantity) => {
                    void handleQuantityChange(cartItemId, quantity);
                  }}
                  onSelect={selection.toggleItem}
                />
              ))}
            </ul>

            <CartSummary totals={totals} />
          </div>
        ) : null}
      </main>

      {notice ? (
        <div
          className={`page-content pointer-events-none absolute inset-x-0 z-20 ${
            state.kind === "ready" && items.length > 0
              ? "bottom-36"
              : "bottom-20"
          }`}
        >
          <Toast>{notice}</Toast>
        </div>
      ) : null}

      {state.kind === "ready" && items.length > 0 ? (
        <div className="shrink-0 border-t border-border bg-surface px-5 py-3">
          <Button
            className="w-full min-h-12"
            disabled={
              selection.selectedCount === 0 || isMutating
            }
            onClick={handleOrder}
          >
            {selection.selectedCount === 0 ? "상품을 선택해 주세요" : "주문하기"}
          </Button>
        </div>
      ) : null}

      <BottomNavigation
        onUnavailableTabClick={() => showNotice(UNAVAILABLE_NOTICE)}
      />

      <DeleteCartItemsDialog
        fallbackFocusRef={headingRef}
        isOpen={deleteTarget !== null}
        isSubmitting={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          void handleDeleteConfirm();
        }}
      />
    </div>
  );
}
