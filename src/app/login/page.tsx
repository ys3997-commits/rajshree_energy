"use client";

import { FormEvent, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { signInWithStaffPassword, signOutStaff } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const username = String(form.get("username") || "");
    const password = String(form.get("password") || "");

    const supabase = createClient();
    if (username.includes("@")) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: username.trim(),
        password,
      });

      if (!signInError) {
        await signOutStaff();
        window.location.assign("/");
        return;
      }
    }

    const staff = await signInWithStaffPassword(username, password);

    if (staff.ok) {
      await supabase.auth.signOut();
      window.location.assign(staff.href);
      return;
    }

    setLoading(false);

    if ("reason" in staff && staff.reason === "no-pages") {
      setError("This login has no pages assigned. Ask the owner to grant access.");
      return;
    }

    setError("Invalid username or password");
  }

  return (
    <div className="login-shell">
      <form
        method="post"
        action="/login"
        autoComplete="on"
        onSubmit={onSubmit}
        className="login-card"
      >
        <div className="login-brand">
          <BrandMark size="md" />
          <div>
            <p className="brand">
              Yura <span>Books</span>
            </p>
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}

        <div className="login-field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            required
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="prakash.surana"
          />
        </div>

        <div className="login-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
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
