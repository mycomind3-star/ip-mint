"use client";

import { useState } from "react";
import { getTxExplorerUrl } from "@/lib/blockchain";

interface MintResult {
  tokenId: number;
  txHash: string;
  contentHash: string;
  ipfsUri: string;
  network: string;
  timestamp: string;
  contentPreview: string;
}

export default function ProofDisplay({
  result,
  onMintAnother,
}: {
  result: MintResult;
  onMintAnother: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const verifyUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/verify/${result.tokenId}`;
  const explorerUrl = getTxExplorerUrl(result.txHash, result.network);
  const certUrl = `/api/certificate/${result.tokenId}`;

  const shortHash = (h: string) => `${h.slice(0, 8)}...${h.slice(-4)}`;

  const copyLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = encodeURIComponent(
    `I just timestamped proof of my idea on the blockchain with @IPMint 🔐\n\nVerify it: ${verifyUrl}`
  );

  return (
    <div className="w-full max-w-2xl">
      {/* Success header */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900">Your idea is now protected.</h2>
        <p className="text-gray-500 text-sm mt-1">
          Blockchain-anchored proof created — {new Date(result.timestamp).toLocaleString()}
        </p>
      </div>

      {/* Certificate card */}
      <div className="border-2 border-black rounded-2xl overflow-hidden mb-6">
        {/* Gold header bar */}
        <div className="bg-yellow-400 px-6 py-3 flex items-center justify-between">
          <span className="font-bold tracking-wide text-black text-sm">
            IP<span className="opacity-60">MINT</span>
          </span>
          <span className="text-xs font-semibold text-black tracking-widest uppercase">
            Proof of Existence
          </span>
          <span className="text-xs font-mono text-black">#{result.tokenId}</span>
        </div>

        {/* Content */}
        <div className="p-6 bg-white">
          {/* Idea preview */}
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 mb-5 italic text-sm text-gray-700">
            "{result.contentPreview}{result.contentPreview.length >= 80 ? "..." : ""}"
          </div>

          {/* Fields */}
          <div className="space-y-3">
            <div className="flex justify-between items-start text-sm border-b border-gray-50 pb-3">
              <span className="text-gray-400 text-xs uppercase tracking-wider font-medium pt-0.5">
                Token ID
              </span>
              <span className="font-mono font-semibold">#{result.tokenId}</span>
            </div>
            <div className="flex justify-between items-start text-sm border-b border-gray-50 pb-3">
              <span className="text-gray-400 text-xs uppercase tracking-wider font-medium pt-0.5">
                Timestamp
              </span>
              <span className="font-medium text-right">
                {new Date(result.timestamp).toLocaleString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                  hour: "2-digit", minute: "2-digit", second: "2-digit",
                  timeZone: "UTC", timeZoneName: "short",
                })}
              </span>
            </div>
            <div className="flex justify-between items-start text-sm border-b border-gray-50 pb-3">
              <span className="text-gray-400 text-xs uppercase tracking-wider font-medium pt-0.5">
                Content Hash
              </span>
              <span className="font-mono text-xs">{shortHash(result.contentHash)}</span>
            </div>
            <div className="flex justify-between items-start text-sm border-b border-gray-50 pb-3">
              <span className="text-gray-400 text-xs uppercase tracking-wider font-medium pt-0.5">
                Network
              </span>
              <span className="font-medium capitalize">{result.network} Mainnet</span>
            </div>
            <div className="flex justify-between items-start text-sm">
              <span className="text-gray-400 text-xs uppercase tracking-wider font-medium pt-0.5">
                Transaction
              </span>
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-blue-600 hover:text-blue-800 underline"
              >
                {shortHash(result.txHash)} ↗
              </a>
            </div>
          </div>

          {/* Status badge */}
          <div className="mt-5 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-green-800 text-sm font-semibold">VERIFIED ON-CHAIN</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <a
          href={certUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1.5 border border-gray-200 rounded-xl py-4 px-3 hover:border-gray-400 hover:bg-gray-50 transition text-center"
        >
          <span className="text-xl">📄</span>
          <span className="text-xs font-medium text-gray-700">Download PDF</span>
        </a>

        <button
          onClick={copyLink}
          className="flex flex-col items-center gap-1.5 border border-gray-200 rounded-xl py-4 px-3 hover:border-gray-400 hover:bg-gray-50 transition"
        >
          <span className="text-xl">{copied ? "✅" : "🔗"}</span>
          <span className="text-xs font-medium text-gray-700">
            {copied ? "Copied!" : "Copy Link"}
          </span>
        </button>

        <a
          href={`https://twitter.com/intent/tweet?text=${shareText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1.5 border border-gray-200 rounded-xl py-4 px-3 hover:border-gray-400 hover:bg-gray-50 transition"
        >
          <span className="text-xl">𝕏</span>
          <span className="text-xs font-medium text-gray-700">Share</span>
        </a>
      </div>

      {/* Secondary actions */}
      <div className="flex gap-3">
        <a
          href={`/verify/${result.tokenId}`}
          className="flex-1 text-center py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          View Verification Page →
        </a>
        <button
          onClick={onMintAnother}
          className="flex-1 py-3 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
        >
          Mint Another Idea
        </button>
      </div>
    </div>
  );
}
