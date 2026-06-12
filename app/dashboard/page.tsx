"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface MintRecord {
  id: string;
  token_id: number;
  content_preview: string;
  content_type: string;
  content_hash: string;
  tx_hash: string;
  network: string;
  is_private: boolean;
  created_at: string;
}

interface SubStatus {
  plan: string;
  mintsUsed: number;
  mintsLimit: number;
  mintsRemaining: number;
  resetDate: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mints, setMints] = useState<MintRecord[]>([]);
  const [subStatus, setSubStatus] = useState<SubStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (!session) return;

    Promise.all([
      fetch("/api/subscription/status").then((r) => r.json()),
      fetch("/api/mints").then((r) => r.json()),
    ]).then(([sub, mintsData]) => {
      setSubStatus(sub);
      setMints(mintsData.mints || []);
      setLoading(false);
    });
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <a href="/" className="text-xl font-bold tracking-wide">
          IP<span className="text-yellow-500">MINT</span>
        </a>
        <div className="flex items-center gap-4 text-sm">
          <a href="/account" className="text-gray-500 hover:text-gray-900">Account</a>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Mints</h1>

        {/* Usage bar */}
        {subStatus && (
          <div className="border border-gray-200 rounded-xl p-5 mb-8 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-900 capitalize mb-1">
                {subStatus.plan} Plan
              </div>
              <div className="text-xs text-gray-500">
                {subStatus.mintsUsed} / {subStatus.mintsLimit} mints used this month
              </div>
              <div className="mt-2 w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black rounded-full"
                  style={{ width: `${Math.min(100, (subStatus.mintsUsed / subStatus.mintsLimit) * 100)}%` }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <a href="/" className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
                + New Mint
              </a>
              {subStatus.plan === "free" && (
                <a href="/pricing" className="border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                  Upgrade
                </a>
              )}
            </div>
          </div>
        )}

        {/* Mints list */}
        {mints.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl">
            <div className="text-4xl mb-3">💡</div>
            <h3 className="font-semibold text-gray-900 mb-2">No mints yet</h3>
            <p className="text-gray-500 text-sm mb-6">Protect your first idea in 60 seconds.</p>
            <a href="/" className="bg-black text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition">
              Mint My First Idea →
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {mints.map((mint) => (
              <div key={mint.id} className="border border-gray-200 rounded-xl p-4 flex items-start justify-between hover:border-gray-300 transition">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium capitalize">
                      {mint.content_type}
                    </span>
                    {mint.is_private && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        🔒 Private
                      </span>
                    )}
                    <span className="text-xs text-gray-400 font-mono">#{mint.token_id}</span>
                  </div>
                  <p className="text-sm text-gray-900 font-medium truncate">
                    {mint.content_preview}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(mint.created_at).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <a
                    href={`/verify/${mint.token_id}`}
                    className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 transition"
                  >
                    Verify
                  </a>
                  <a
                    href={`/api/certificate/${mint.token_id}`}
                    target="_blank"
                    className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 transition"
                  >
                    PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
