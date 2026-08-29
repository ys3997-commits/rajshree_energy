const APPROVAL_DIGITS = 4;
const MAX_SEQUENCE = 10 ** APPROVAL_DIGITS - 1;

export function formatApprovalNumber(year: number, sequence: number): string {
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error("Approval year must be between 2000 and 2100");
  }
  if (!Number.isInteger(sequence) || sequence < 1 || sequence > MAX_SEQUENCE) {
    throw new Error(
      `Approval sequence must be between 1 and ${MAX_SEQUENCE}`,
    );
  }
  return `AN ${year}-${String(sequence).padStart(APPROVAL_DIGITS, "0")}`;
}

export function parseApprovalNumber(
  value: string | null | undefined,
): { year: number; sequence: number } | null {
  if (!value) return null;
  const match = /^AN\s+(\d{4})-(\d+)$/i.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const sequence = Number(match[2]);
  if (!Number.isInteger(year) || !Number.isInteger(sequence) || sequence < 1) {
    return null;
  }
  return { year, sequence };
}

export function approvalYearFromIsoDay(value: string): number {
  const trimmed = value.trim().slice(0, 10);
  const match = /^(\d{4})-\d{2}-\d{2}$/.exec(trimmed);
  if (!match) {
    throw new Error("Date is required");
  }
  return Number(match[1]);
}

export function nextApprovalNumber(
  existingNumbers: Array<string | null | undefined>,
  year: number,
): string {
  let max = 0;
  for (const value of existingNumbers) {
    const parsed = parseApprovalNumber(value);
    if (parsed?.year === year) {
      max = Math.max(max, parsed.sequence);
    }
  }
  return formatApprovalNumber(year, max + 1);
}
