const LOGIN_RETURN_TO_KEY = "bookjeokbookjeok.auth.return-to";

export function getInternalLoginReturnTo(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  try {
    const url = new URL(value, window.location.origin);

    if (url.origin !== window.location.origin) {
      return null;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function saveLoginReturnTo(value: unknown) {
  const returnTo = getInternalLoginReturnTo(value);

  try {
    if (returnTo) {
      window.sessionStorage.setItem(LOGIN_RETURN_TO_KEY, returnTo);
    } else {
      window.sessionStorage.removeItem(LOGIN_RETURN_TO_KEY);
    }
  } catch {
    // Login can still continue when storage is unavailable, without restoring a route.
  }
}

export function readLoginReturnTo() {
  try {
    return getInternalLoginReturnTo(
      window.sessionStorage.getItem(LOGIN_RETURN_TO_KEY),
    );
  } catch {
    return null;
  }
}

export function clearLoginReturnTo() {
  try {
    window.sessionStorage.removeItem(LOGIN_RETURN_TO_KEY);
  } catch {
    // The caller still needs to finish the login flow when storage is blocked.
  }
}
