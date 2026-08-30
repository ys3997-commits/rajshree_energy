"use client";

import { useRouter } from "next/navigation";

export function TableRefreshButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={() => router.refresh()}
    >
      Refresh
    </button>
  );
}
