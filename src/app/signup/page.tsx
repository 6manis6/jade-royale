"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const requestOtp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const res = await fetch("/api/auth/signup/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to send OTP.");
      return;
    }

    setStep("otp");
    setMessage("OTP sent to your email. Enter it below.");
  };

  const verifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/signup/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      setError(data.error || "OTP verification failed.");
      return;
    }

    const loginRes = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!loginRes?.ok) {
      router.push("/login");
      return;
    }

    router.push("/");
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-16">
      <div className="max-w-md mx-auto bg-[var(--jade-card)] border border-[var(--jade-border)] rounded-2xl p-8 shadow-sm">
        <h1 className="text-3xl font-serif text-[var(--jade-text)] mb-2">
          Create Account
        </h1>
        <p className="text-[var(--jade-muted)] mb-8">
          Join Jade Royale and start shopping.
        </p>

        {step === "form" ? (
          <form onSubmit={requestOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--jade-muted-strong)] mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--jade-input)] border border-[var(--jade-border)] rounded-xl outline-none text-[var(--jade-text)]"
              />
            </div>

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
                minLength={6}
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
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--jade-muted-strong)] mb-1">
                Enter OTP
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--jade-input)] border border-[var(--jade-border)] rounded-xl outline-none text-[var(--jade-text)] tracking-[0.4em]"
              />
            </div>

            {message && <p className="text-sm text-green-600">{message}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--color-jade-pink)] text-white py-3 rounded-xl font-semibold hover:bg-black transition-colors disabled:opacity-70"
            >
              {loading ? "Verifying..." : "Verify OTP & Create Account"}
            </button>

            <button
              type="button"
              onClick={() => setStep("form")}
              className="w-full text-sm text-[var(--jade-muted)] hover:text-[var(--color-jade-pink)]"
            >
              Change email or password
            </button>
          </form>
        )}

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full mt-4 bg-white text-black border border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
        >
          Continue with Google
        </button>

        <p className="text-sm text-[var(--jade-muted)] mt-6 text-center">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[var(--color-jade-pink)] font-semibold"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
