/** Set in this tab after sign-in. A new tab does not have it, so closing the page ends the login. */
export const BROWSER_SESSION_KEY = "re-browser-session";

export function markBrowserSession() {
  sessionStorage.setItem(BROWSER_SESSION_KEY, "1");
}

/** Drop expiry so the cookie ends when the browser quits. Keep maxAge 0, which deletes the cookie. */
export function asSessionCookie<T extends { maxAge?: number; expires?: Date }>(
  options: T,
): T {
  if (options.maxAge === 0) return options;
  const next = { ...options };
  delete next.maxAge;
  delete next.expires;
  return next;
}
