export const UNAUTHORISED_CUSTOMER_MESSAGE =
  "You are not authorised for this customer";

export class AccessDeniedError extends Error {
  constructor(message = "You do not have access to this page") {
    super(message);
    this.name = "AccessDeniedError";
  }
}

/** Turn a customer-scope denial into a value the browser can show in production. */
export function customerAccessFailure(
  error: unknown,
): { error: string } | null {
  if (
    error instanceof AccessDeniedError &&
    error.message === UNAUTHORISED_CUSTOMER_MESSAGE
  ) {
    return { error: UNAUTHORISED_CUSTOMER_MESSAGE };
  }
  return null;
}

/** Re-throw a returned action error on the client so the form can display it. */
export function throwIfActionError(result: unknown): void {
  if (
    result != null &&
    typeof result === "object" &&
    "error" in result &&
    typeof (result as { error?: unknown }).error === "string"
  ) {
    throw new Error((result as { error: string }).error);
  }
}
