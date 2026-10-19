const MOCK_PREFIX = "bookjeok:mock:";
const MOCK_CHANGE_EVENT = "bookjeok:mock-change";

export function readMockValue<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(`${MOCK_PREFIX}${key}`);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeMockValue<T>(key: string, value: T) {
  window.localStorage.setItem(`${MOCK_PREFIX}${key}`, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(MOCK_CHANGE_EVENT, { detail: key }));
}

export function clearMockValues() {
  const keys = Array.from({ length: window.localStorage.length }, (_, index) =>
    window.localStorage.key(index),
  ).filter((key): key is string => key?.startsWith(MOCK_PREFIX) === true);

  keys.forEach((key) => window.localStorage.removeItem(key));
  window.dispatchEvent(new CustomEvent(MOCK_CHANGE_EVENT));
}

export function subscribeMockValue(key: string, listener: () => void) {
  const handleChange = (event: Event) => {
    const detail = (event as CustomEvent<string | undefined>).detail;
    if (detail === undefined || detail === key) listener();
  };
  const handleStorage = (event: StorageEvent) => {
    if (event.key === `${MOCK_PREFIX}${key}`) listener();
  };

  window.addEventListener(MOCK_CHANGE_EVENT, handleChange);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(MOCK_CHANGE_EVENT, handleChange);
    window.removeEventListener("storage", handleStorage);
  };
}
