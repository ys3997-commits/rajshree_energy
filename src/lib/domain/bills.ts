export const BILL_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type BillStatus = (typeof BILL_STATUSES)[number];

export const BILL_STATUS_LABEL: Record<BillStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export const MAX_BILL_FILE_BYTES = 4 * 1024 * 1024;
export const MAX_BILL_FILES = 1;
export const MAX_BILL_TOTAL_BYTES = MAX_BILL_FILE_BYTES;
export const MAX_BILL_REMARK_WORDS = 25;

const ALLOWED_BILL_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MIME_FROM_EXTENSION: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export function isBillStatus(value: string): value is BillStatus {
  return BILL_STATUSES.includes(value as BillStatus);
}

export function parseBillStatusFilter(
  value: string | null | undefined,
): BillStatus | null {
  if (!value || value === "all") return null;
  const status = value.trim().toUpperCase();
  return isBillStatus(status) ? status : null;
}

export function parseIsoDay(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  if (Number.isNaN(new Date(`${trimmed}T00:00:00.000Z`).getTime())) return null;
  return trimmed;
}

export function parseBillTextFilter(
  value: string | null | undefined,
): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed || null;
}

export function billDateRange(
  dateFrom: string | null,
  dateTo: string | null,
): { date: { gte?: Date; lte?: Date } } | Record<string, never> {
  if (!dateFrom && !dateTo) return {};
  const date: { gte?: Date; lte?: Date } = {};
  if (dateFrom) date.gte = new Date(`${dateFrom}T00:00:00.000Z`);
  if (dateTo) date.lte = new Date(`${dateTo}T23:59:59.999Z`);
  return { date };
}

export function validateBillRemark(value: string, label: string): string {
  const remark = value.trim();
  if (!remark) throw new Error(`${label} is required`);
  return remark;
}

export function countRemarkWords(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/** First line of a remark for compact table display. */
export function remarkFirstLine(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  return trimmed.split(/\r?\n/, 1)[0] ?? "";
}

/** Whether the remark has more text than the one-line table preview. */
export function remarkIsExpandable(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (trimmed.includes("\n") || trimmed.includes("\r")) return true;
  return trimmed.length > 48;
}

export function validateOwnerReviewRemark(value: string, label: string): string {
  const remark = validateBillRemark(value, label);
  if (countRemarkWords(remark) > MAX_BILL_REMARK_WORDS) {
    throw new Error(
      `${label} must be at most ${MAX_BILL_REMARK_WORDS} words`,
    );
  }
  return remark;
}

export function validateInvoiceIssuedBy(value: string): string {
  const name = value.trim();
  if (!name) throw new Error("Invoice issued by is required");
  return name;
}

export function validateApproverName(value: string): string {
  const name = value.trim();
  if (!name) throw new Error("Approver name is required");
  return name;
}

export function validateInvoiceAmount(value: string): string {
  const raw = value.trim().replace(/,/g, "");
  if (!raw) throw new Error("Invoice amount is required");
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) {
    throw new Error("Invoice amount is invalid");
  }
  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invoice amount must be greater than zero");
  }
  return raw;
}

export function mimeFromFileName(fileName: string): string | null {
  const ext = fileName.split(".").pop()?.trim().toLowerCase() ?? "";
  return MIME_FROM_EXTENSION[ext] ?? null;
}

export function validateBillFile(file: {
  name: string;
  type: string;
  size: number;
}): { fileName: string; mime: string } {
  const fileName = file.name.trim() || "bill";
  if (!file.size) throw new Error("Document is required");
  if (file.size > MAX_BILL_FILE_BYTES) {
    throw new Error("File must be 4 MB or smaller");
  }
  const mime = file.type || mimeFromFileName(fileName);
  if (!mime || !ALLOWED_BILL_MIME.has(mime)) {
    throw new Error("Upload a PDF or image (JPG, PNG, WebP, GIF)");
  }
  return { fileName, mime };
}

export function validateBillFiles(
  files: { name: string; type: string; size: number }[],
): { fileName: string; mime: string }[] {
  const uploaded = files.filter((file) => file.size > 0 || file.name.trim());
  if (uploaded.length === 0) throw new Error("Document is required");
  if (uploaded.length > MAX_BILL_FILES) {
    throw new Error("Upload only one document");
  }
  let total = 0;
  const meta = uploaded.map((file) => {
    total += file.size;
    return validateBillFile(file);
  });
  if (total > MAX_BILL_TOTAL_BYTES) {
    throw new Error("Document must be 4 MB or smaller");
  }
  return meta;
}

export function canViewBill(
  access: { kind: string; id?: string },
  staffId: string,
): boolean {
  if (access.kind === "owner") return true;
  if (access.kind === "staff") return access.id === staffId;
  return false;
}

export function canUploadBill(access: { kind: string }): boolean {
  return access.kind === "staff";
}

export function canReviewBill(
  access: { kind: string },
  status: string,
): boolean {
  return access.kind === "owner" && status === "PENDING";
}

export function validateAccountVoucherNo(value: string): string {
  return value.trim();
}
