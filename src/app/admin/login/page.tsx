"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, LogIn } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState("/admin");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    if (next) {
      setNextPath(next);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Login failed");
        setLoading(false);
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Unexpected login error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20 bg-[var(--jade-bg)]">
      <div className="w-full max-w-md bg-[var(--jade-card)] border border-[var(--jade-border)] rounded-2xl p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--jade-muted)] font-semibold">
          Secure Access
        </p>
        <h1 className="font-serif text-3xl text-[var(--jade-text)] mt-3">
          Admin Login
        </h1>
        <p className="text-sm text-[var(--jade-muted)] mt-2">
          Sign in with your admin username and password.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-semibold text-[var(--jade-muted-strong)]">
              Username
            </label>
            <div className="mt-2 flex items-center gap-2 px-3 py-3 bg-[var(--jade-input)] border border-[var(--jade-border)] rounded-xl">
              <User size={18} className="text-[var(--jade-muted)]" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-transparent outline-none text-[var(--jade-text)]"
                placeholder="Enter username"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-[var(--jade-muted-strong)]">
              Password
            </label>
            <div className="mt-2 flex items-center gap-2 px-3 py-3 bg-[var(--jade-input)] border border-[var(--jade-border)] rounded-xl">
              <Lock size={18} className="text-[var(--jade-muted)]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent outline-none text-[var(--jade-text)]"
                placeholder="Enter password"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[var(--color-jade-pink)] text-white py-3 rounded-xl font-semibold hover:bg-[var(--color-jade-pink-hover)] transition-colors flex items-center justify-center gap-2 disabled:bg-[var(--jade-border)] disabled:text-[var(--jade-muted)]"
          >
            <LogIn size={18} />
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
