"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { markBrowserSession } from "@/lib/auth/browserSession";
import { signInWithStaffPassword, signOutStaff } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    if (username.includes("@")) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: username.trim(),
        password,
      });

      if (!signInError) {
        await signOutStaff();
        markBrowserSession();
        setLoading(false);
        router.push("/");
        router.refresh();
        return;
      }
    }

    const staff = await signInWithStaffPassword(username, password);
    setLoading(false);

    if (staff.ok) {
      await supabase.auth.signOut();
      markBrowserSession();
      router.push(staff.href);
      router.refresh();
      return;
    }

    if ("reason" in staff && staff.reason === "no-pages") {
      setError("This login has no pages assigned. Ask the owner to grant access.");
      return;
    }

    setError("Invalid username or password");
  }

  return (
    <div className="login-shell">
      <form onSubmit={onSubmit} className="login-card">
        <div className="login-brand">
          <BrandMark size="md" />
          <div>
            <p className="brand">
              Yura <span>Books</span>
            </p>
            <p className="login-brand-tag">Trading books &amp; operations</p>
          </div>
        </div>
        <p className="lede">
          Sign in with your username and password. Username is first name and
          last name, for example prakash.surana.
        </p>

        {error && <div className="error-box">{error}</div>}

        <div className="login-field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
