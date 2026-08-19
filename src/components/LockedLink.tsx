import Link from "next/link";
import type { ComponentProps } from "react";

type Props = {
  href: string;
  allowed: boolean;
  className?: string;
  children: React.ReactNode;
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">;

export function LockedLink({
  href,
  allowed,
  className,
  children,
  ...rest
}: Props) {
  if (!allowed) {
    return (
      <span
        className={`${className ?? ""} is-locked`.trim()}
        aria-disabled="true"
        title="No access"
      >
        {children}
      </span>
    );
  }

  return (
    <Link href={href} className={className} {...rest}>
      {children}
    </Link>
  );
}
