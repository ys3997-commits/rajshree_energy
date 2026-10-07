import Image from "next/image";

type Props = {
  /** Compact mark for the app header */
  size?: "sm" | "md";
  className?: string;
};

export function BrandMark({ size = "sm", className }: Props) {
  const px = size === "md" ? 48 : 28;
  return (
    <Image
      src="/logo.png"
      alt=""
      width={px}
      height={px}
      priority
      className={className ?? "brand-mark-img"}
      style={{ width: px, height: px }}
    />
  );
}
