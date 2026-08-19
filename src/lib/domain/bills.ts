export const BILL_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type BillStatus = (typeof BILL_STATUSES)[number];

export const BILL_STATUS_LABEL: Record<BillStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export const MAX_BILL_FILE_BYTES = 4 * 1024 * 1024;

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

export function validateBillRemark(value: string, label: string): string {
  const remark = value.trim();
  if (!remark) throw new Error(`${label} is required`);
  return remark;
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
  if (!file.size) throw new Error("File is required");
  if (file.size > MAX_BILL_FILE_BYTES) {
    throw new Error("File must be 4 MB or smaller");
  }
  const mime = file.type || mimeFromFileName(fileName);
  if (!mime || !ALLOWED_BILL_MIME.has(mime)) {
    throw new Error("Upload a PDF or image (JPG, PNG, WebP, GIF)");
  }
  return { fileName, mime };
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
