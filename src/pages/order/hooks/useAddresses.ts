import { useEffect, useState } from "react";

import { fetchUserAddresses } from "@/features/order/api/addressApi";
import type { UserAddress } from "@/features/order/types/order";

export type AddressesState =
  | { kind: "loading" }
  | { addresses: UserAddress[]; kind: "ready" }
  | { kind: "error" };

interface StoredAddressesState {
  requestKey: number;
  state: AddressesState;
}

export function useAddresses() {
  const [retryCount, setRetryCount] = useState(0);
  const [stored, setStored] = useState<StoredAddressesState>({
    requestKey: -1,
    state: { kind: "loading" },
  });

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    void fetchUserAddresses(controller.signal).then((result) => {
      if (!isActive) {
        return;
      }

      setStored({
        requestKey: retryCount,
        state: result.ok
          ? { addresses: result.addresses, kind: "ready" }
          : { kind: "error" },
      });
    });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [retryCount]);

  const retry = () => setRetryCount((current) => current + 1);
  const state =
    stored.requestKey === retryCount ? stored.state : { kind: "loading" as const };

  return { retry, state };
}
