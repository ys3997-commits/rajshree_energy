"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithStaffPassword, signOutStaff } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!signInError) {
      await signOutStaff();
      setLoading(false);
      router.push("/");
      router.refresh();
      return;
    }

    const staff = await signInWithStaffPassword(password);
    setLoading(false);

    if (staff.ok) {
      await supabase.auth.signOut();
      router.push(staff.href);
      router.refresh();
      return;
    }

    if ("reason" in staff && staff.reason === "no-pages") {
      setError("This login has no pages assigned. Ask the owner to grant access.");
      return;
    }

    setError("Invalid email or password");
  }

  return (
    <div className="login-shell">
      <form onSubmit={onSubmit} className="login-card">
        <div className="mb-6">
          <Image
            src="/logo.png"
            alt="Rajshree"
            width={200}
            height={56}
            priority
            className="brand-logo-img"
            style={{ height: 48, maxWidth: 220 }}
          />
        </div>
        <p className="lede">Sign in with your email and password.</p>

        {error && <div className="error-box">{error}</div>}

        <div className="login-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
        </div>

        <div className="login-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          className="btn w-full"
          style={{ marginTop: "0.75rem" }}
          disabled={loading}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
