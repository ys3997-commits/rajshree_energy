const ORDER_DIGITS = 4;
const MAX_SEQUENCE = 10 ** ORDER_DIGITS - 1;

export function formatSaleOrderNumber(sequence: number): string {
  if (!Number.isInteger(sequence) || sequence < 1 || sequence > MAX_SEQUENCE) {
    throw new Error(`Sale order sequence must be between 1 and ${MAX_SEQUENCE}`);
  }
  return `SO ${String(sequence).padStart(ORDER_DIGITS, "0")}`;
}

export function formatPurchaseOrderNumber(sequence: number): string {
  if (!Number.isInteger(sequence) || sequence < 1 || sequence > MAX_SEQUENCE) {
    throw new Error(
      `Purchase order sequence must be between 1 and ${MAX_SEQUENCE}`,
    );
  }
  return `PO ${String(sequence).padStart(ORDER_DIGITS, "0")}`;
}

/** Recognize SO 0001 and legacy sale PO formats when suggesting the next number. */
export function parseSaleOrderSequence(poNumber: string): number | null {
  const trimmed = poNumber.trim();
  const soMatch = /^SO\s*(\d+)$/i.exec(trimmed);
  if (soMatch) return Number(soMatch[1]);
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  const legacyMatch = /^PO-\d+-(\d+)$/i.exec(trimmed);
  if (legacyMatch) return Number(legacyMatch[1]);
  return null;
}

/** Recognize PO 0001 and legacy purchase PO formats when suggesting the next number. */
export function parsePurchaseOrderSequence(poNumber: string): number | null {
  const trimmed = poNumber.trim();
  const poMatch = /^PO\s*(\d+)$/i.exec(trimmed);
  if (poMatch) return Number(poMatch[1]);
  const legacyMatch = /^PU-(\d+)$/i.exec(trimmed);
  if (legacyMatch) return Number(legacyMatch[1]);
  return null;
}

export function nextSaleOrderNumber(existingPoNumbers: string[]): string {
  let max = 0;
  for (const poNumber of existingPoNumbers) {
    const seq = parseSaleOrderSequence(poNumber);
    if (seq != null) max = Math.max(max, seq);
  }
  return formatSaleOrderNumber(max + 1);
}

export function nextPurchaseOrderNumber(existingPoNumbers: string[]): string {
  let max = 0;
  for (const poNumber of existingPoNumbers) {
    const seq = parsePurchaseOrderSequence(poNumber);
    if (seq != null) max = Math.max(max, seq);
  }
  return formatPurchaseOrderNumber(max + 1);
}

export function normalizeSaleOrderNumber(input: string): string {
  const trimmed = input.trim().toUpperCase().replace(/\s+/g, " ");
  const match = /^SO (\d+)$/.exec(trimmed);
  if (!match) {
    throw new Error("Sale order number must be like SO 0001");
  }
  const sequence = Number(match[1]);
  if (!Number.isInteger(sequence) || sequence < 1) {
    throw new Error("Sale order number must be like SO 0001");
  }
  return formatSaleOrderNumber(sequence);
}

export function normalizePurchaseOrderNumber(input: string): string {
  const trimmed = input.trim().toUpperCase().replace(/\s+/g, " ");
  const match = /^PO (\d+)$/.exec(trimmed);
  if (!match) {
    throw new Error("Purchase order number must be like PO 0001");
  }
  const sequence = Number(match[1]);
  if (!Number.isInteger(sequence) || sequence < 1) {
    throw new Error("Purchase order number must be like PO 0001");
  }
  return formatPurchaseOrderNumber(sequence);
}
