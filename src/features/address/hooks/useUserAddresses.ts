import { useEffect, useState } from "react";

import { fetchUserAddresses } from "@/features/address/api/addressApi";
import type { UserAddress } from "@/features/address/types/address";

export type UserAddressesState =
  | { kind: "loading" }
  | { addresses: UserAddress[]; kind: "ready" }
  | { kind: "error" };

interface StoredUserAddressesState {
  requestKey: number;
  state: UserAddressesState;
}

export const MAX_USER_ADDRESS_COUNT = 3;

export function useUserAddresses() {
  const [requestKey, setRequestKey] = useState(0);
  const [stored, setStored] = useState<StoredUserAddressesState>({
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
        requestKey,
        state: result.ok
          ? { addresses: result.addresses, kind: "ready" }
          : { kind: "error" },
      });
    });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [requestKey]);

  // Re-reads the server list so default flags always reflect the backend's own policy.
  const reload = () => setRequestKey((current) => current + 1);
  const isReloading = stored.requestKey !== requestKey;
  // Keeps the last list on screen while a reload is in flight instead of flashing a loading state.
  const state =
    !isReloading || stored.state.kind === "ready"
      ? stored.state
      : { kind: "loading" as const };

  return { isReloading, reload, state };
}
