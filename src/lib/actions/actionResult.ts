/** Expected user-facing failures from Server Actions — return these, never throw. */

export type ActionOk = { ok: true };
export type ActionFail = { ok: false; error: string };
export type ActionResult = ActionOk | ActionFail;

export function actionOk(): ActionOk {
  return { ok: true };
}

export function actionFail(error: string): ActionFail {
  return { ok: false, error };
}

/** Map a caught client-side failure to a display string (production digests throwaways). */
export function clientActionError(
  err: unknown,
  fallback = "Something went wrong",
): string {
  if (!(err instanceof Error)) return fallback;
  const message = err.message.trim();
  if (
    !message ||
    /omitted in production builds/i.test(message) ||
    /digest property is included/i.test(message)
  ) {
    return fallback;
  }
  return message;
}
