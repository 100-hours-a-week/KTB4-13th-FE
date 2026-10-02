export interface CartChangeEvent {
  animate?: boolean;
}

type CartChangeListener = (event: CartChangeEvent) => void;

const listeners = new Set<CartChangeListener>();

export function notifyCartChanged(event: CartChangeEvent = {}) {
  listeners.forEach((listener) => listener(event));
}

export function subscribeCartChanges(listener: CartChangeListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
