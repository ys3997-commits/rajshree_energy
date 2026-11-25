export type CorrectionStatus = "PENDING" | "DONE";

export const CORRECTION_STATUS_LABEL: Record<CorrectionStatus, string> = {
  PENDING: "Pending",
  DONE: "Done",
};

export const MAX_CORRECTION_MESSAGE_CHARS = 2000;

export function validateCorrectionMessage(raw: string): string {
  const message = raw.trim().replace(/\s+/g, " ");
  if (!message) {
    throw new Error("Correction message is required");
  }
  if (message.length > MAX_CORRECTION_MESSAGE_CHARS) {
    throw new Error(
      `Correction message must be at most ${MAX_CORRECTION_MESSAGE_CHARS} characters`,
    );
  }
  return message;
}

export function parseCorrectionStatus(
  value: string | null | undefined,
): CorrectionStatus | null {
  if (value === "PENDING" || value === "DONE") return value;
  return null;
}
