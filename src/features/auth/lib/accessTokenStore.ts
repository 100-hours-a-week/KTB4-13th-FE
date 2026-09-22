type AccessTokenListener = (accessToken: string | null) => void;

let accessToken: string | null = null;
const listeners = new Set<AccessTokenListener>();

function notifyListeners() {
  for (const listener of listeners) {
    listener(accessToken);
  }
}

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(nextAccessToken: string) {
  accessToken = nextAccessToken;
  notifyListeners();
}

export function clearAccessToken() {
  accessToken = null;
  notifyListeners();
}

export function subscribeAccessToken(listener: AccessTokenListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
