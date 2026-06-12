"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subStatus, setSubStatus] = useState<{
    plan: string;
    mintsUsed: number;
    mintsLimit: number;
    resetDate: string;
  } | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  const success = searchParams.get("success");
  const plan = searchParams.get("plan");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
  }, [status, router]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/subscription/status")
      .then((r) => r.json())
      .then(setSubStatus);
  }, [session]);

  const handleUpgrade = async (targetPlan: string) => {
    setUpgrading(true);
    const res = await fetch("/api/subscription/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: targetPlan }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setUpgrading(false);
  };

  const handleManageBilling = async () => {
    const res = await fetch("/api/subscription/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  if (status === "loading") {
    return <div className="min-h-screen bg-white flex items-center justify-center text-gray-400 text-sm">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <a href="/" className="text-xl font-bold tracking-wide">
          IP<span className="text-yellow-500">MINT</span>
        </a>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          Sign Out
        </button>
      </nav>

      <div className="max-w-xl mx-auto px-4 py-10">
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 mb-6 flex items-center gap-3">
            <span className="text-green-500 text-xl">✅</span>
            <div>
              <p className="font-semibold text-green-800 text-sm">
                Welcome to the {plan} plan!
              </p>
              <p className="text-green-600 text-xs mt-0.5">Your subscription is now active.</p>
            </div>
          </div>
        )}

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Account</h1>

        {/* Profile */}
        <div className="border border-gray-200 rounded-xl p-5 mb-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Profile</h2>
          <div className="space-y-2">
            {session?.user?.email && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Email</span>
                <span className="font-mono text-gray-900">{session.user.email}</span>
              </div>
            )}
            {session?.user?.walletAddress && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Wallet</span>
                <span className="font-mono text-xs text-gray-900">
                  {session.user.walletAddress.slice(0, 8)}...{session.user.walletAddress.slice(-6)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Subscription */}
        {subStatus && (
          <div className="border border-gray-200 rounded-xl p-5 mb-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Subscription</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Current Plan</span>
                <span className="font-semibold capitalize text-gray-900">{subStatus.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Mints Used</span>
                <span className="text-gray-900">{subStatus.mintsUsed} / {subStatus.mintsLimit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Resets</span>
                <span className="text-gray-900">
                  {new Date(subStatus.resetDate).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {subStatus.plan === "free" ? (
                <>
                  <button
                    onClick={() => handleUpgrade("creator")}
                    disabled={upgrading}
                    className="flex-1 bg-black text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-60"
                  >
                    Upgrade to Creator — $9.99/mo
                  </button>
                </>
              ) : (
                <button
                  onClick={handleManageBilling}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                >
                  Manage Billing →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Danger zone */}
        <div className="border border-gray-100 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-400 mb-3">Account Actions</h2>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm text-gray-500 hover:text-gray-900 transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    </main>
  );
}
