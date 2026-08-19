"use client";

import { useRouter } from "next/navigation";
import { signOutStaff } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await signOutStaff();
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button type="button" onClick={logout} className="btn btn-secondary">
      Log out
    </button>
  );
}
