// Counts API requests in flight so the app can show a thin progress bar when the server is slow.
// Chat and photo-scan requests are left out: those screens have their own waiting state
// (북적이 thinking, photo-scan steps), and a photo scan can take up to a minute.
const UNTRACKED_PREFIXES = ["/api/v1/recommend/chat", "/api/v1/library/photos/scans"];

type Listener = (pendingCount: number) => void;

let pendingCount = 0;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener(pendingCount));
}

export function trackRequest(path: string, request: Promise<Response>): Promise<Response> {
  if (UNTRACKED_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return request;
  }

  pendingCount += 1;
  emit();

  return request.finally(() => {
    pendingCount -= 1;
    emit();
  });
}

export function subscribeRequestActivity(listener: Listener) {
  listeners.add(listener);
  listener(pendingCount);

  return () => {
    listeners.delete(listener);
  };
}
