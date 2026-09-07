import Link from "next/link";

export function PartyNameLink({
  customerId,
  transporterId,
  investmentCompanyId,
  name,
}: {
  customerId: string | null;
  transporterId: string | null;
  investmentCompanyId?: string | null;
  name: string;
}) {
  const label = transporterId
    ? `${name} — Transporter`
    : investmentCompanyId
      ? `${name} — Investment`
      : name;
  if (customerId) {
    return (
      <Link
        href={`/reports/ledger?customerId=${encodeURIComponent(customerId)}`}
        className="btn-link"
      >
        {label}
      </Link>
    );
  }
  if (transporterId) {
    return (
      <Link href={`/transporters/${transporterId}`} className="btn-link">
        {label}
      </Link>
    );
  }
  if (investmentCompanyId) {
    return (
      <Link href="/investments" className="btn-link">
        {label}
      </Link>
    );
  }
  return label;
}
