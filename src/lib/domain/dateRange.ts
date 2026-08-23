/** Inclusive UTC calendar-day range from YYYY-MM-DD query values. */
export function utcDayRange(
  dateFrom?: string,
  dateTo?: string,
): { gte?: Date; lte?: Date } | undefined {
  const from = dateFrom?.trim() ?? "";
  const to = dateTo?.trim() ?? "";
  const range: { gte?: Date; lte?: Date } = {};
  if (/^\d{4}-\d{2}-\d{2}$/.test(from)) {
    range.gte = new Date(`${from}T00:00:00.000Z`);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    range.lte = new Date(`${to}T23:59:59.999Z`);
  }
  return range.gte || range.lte ? range : undefined;
}

export function hasDateFilter(dateFrom?: string, dateTo?: string): boolean {
  return Boolean(dateFrom?.trim() || dateTo?.trim());
}
