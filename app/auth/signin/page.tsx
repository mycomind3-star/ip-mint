"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import WalletConnect from "@/components/WalletConnect";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn("email", { email, redirect: false });
    setSent(true);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <nav className="border-b border-gray-100 px-6 py-4">
        <a href="/" className="text-xl font-bold tracking-wide">
          IP<span className="text-yellow-500">MINT</span>
        </a>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Sign in to IP Mint</h1>
            <p className="text-gray-500 text-sm mt-2">
              Connect your wallet or sign in with email.
            </p>
          </div>

          {sent ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">📬</div>
              <h3 className="font-semibold text-gray-900 mb-1">Check your email</h3>
              <p className="text-sm text-gray-600">
                We sent a magic link to <strong>{email}</strong>.
                Click it to sign in — no password needed.
              </p>
            </div>
          ) : (
            <>
              {/* Wallet */}
              <div className="mb-4">
                <WalletConnect />
              </div>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Email magic link */}
              <form onSubmit={handleEmailSignIn} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition"
                />
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-black text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send Magic Link"}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-5">
                By signing in, you agree to our{" "}
                <a href="/terms" className="underline">Terms</a> and{" "}
                <a href="/privacy" className="underline">Privacy Policy</a>.
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
