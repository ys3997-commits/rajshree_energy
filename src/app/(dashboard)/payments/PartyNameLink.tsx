import Link from "next/link";

export function PartyNameLink({
  customerId,
  transporterId,
  name,
}: {
  customerId: string | null;
  transporterId: string | null;
  name: string;
}) {
  const label = transporterId ? `${name} — Transporter` : name;
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
  return label;
}
