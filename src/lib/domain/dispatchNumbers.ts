const DISPATCH_DIGITS = 4;
const MAX_SEQUENCE = 10 ** DISPATCH_DIGITS - 1;

export function formatDispatchNumber(sequence: number): string {
  if (!Number.isInteger(sequence) || sequence < 1 || sequence > MAX_SEQUENCE) {
    throw new Error(
      `Dispatch sequence must be between 1 and ${MAX_SEQUENCE}`,
    );
  }
  return `DN ${String(sequence).padStart(DISPATCH_DIGITS, "0")}`;
}

export function parseDispatchSequence(
  dispatchNumber: string | null | undefined,
): number | null {
  if (!dispatchNumber) return null;
  const trimmed = dispatchNumber.trim();
  const dnMatch = /^DN\s*(\d+)$/i.exec(trimmed);
  if (dnMatch) return Number(dnMatch[1]);
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  return null;
}

export function nextDispatchNumber(
  existingNumbers: Array<string | null | undefined>,
): string {
  let max = 0;
  for (const value of existingNumbers) {
    const seq = parseDispatchSequence(value);
    if (seq != null) max = Math.max(max, seq);
  }
  return formatDispatchNumber(max + 1);
}

export function normalizeDispatchNumber(input: string): string {
  const trimmed = input.trim().toUpperCase().replace(/\s+/g, " ");
  const match = /^DN (\d+)$/.exec(trimmed) ?? /^(\d+)$/.exec(trimmed);
  if (!match) {
    throw new Error("Dispatch number must be like DN 0001");
  }
  const sequence = Number(match[1]);
  if (!Number.isInteger(sequence) || sequence < 1) {
    throw new Error("Dispatch number must be like DN 0001");
  }
  return formatDispatchNumber(sequence);
}

export function displayDispatchNumber(
  dispatchNumber: string | null | undefined,
): string {
  const seq = parseDispatchSequence(dispatchNumber);
  if (seq != null) return String(seq).padStart(DISPATCH_DIGITS, "0");
  return dispatchNumber?.trim() || "—";
}
