"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (status === "authenticated") {
    router.push("/");
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!result?.ok) {
      setError("Invalid credentials or unverified account.");
      return;
    }

    router.push("/");
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-16">
      <div className="max-w-md mx-auto bg-[var(--jade-card)] border border-[var(--jade-border)] rounded-2xl p-8 shadow-sm">
        <h1 className="text-3xl font-serif text-[var(--jade-text)] mb-2">
          Login
        </h1>
        <p className="text-[var(--jade-muted)] mb-8">
          Welcome back to Jade Royale.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[var(--jade-muted-strong)] mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--jade-input)] border border-[var(--jade-border)] rounded-xl outline-none text-[var(--jade-text)]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--jade-muted-strong)] mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--jade-input)] border border-[var(--jade-border)] rounded-xl outline-none text-[var(--jade-text)]"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-jade-pink)] text-white py-3 rounded-xl font-semibold hover:bg-black transition-colors disabled:opacity-70"
          >
            <span className="inline-flex items-center gap-2">
              <LogIn size={18} />
              {loading ? "Logging in..." : "Login"}
            </span>
          </button>
        </form>

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full mt-4 bg-white text-black border border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
        >
          Continue with Google
        </button>

        <p className="text-sm text-[var(--jade-muted)] mt-6 text-center">
          New customer?{" "}
          <Link
            href="/signup"
            className="text-[var(--color-jade-pink)] font-semibold"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
