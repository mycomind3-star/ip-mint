"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import MintInterface from "@/components/MintInterface";
import { Mint } from "@/lib/db";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-wide">
            IP<span className="text-yellow-500">MINT</span>
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <a href="/pricing" className="text-gray-500 hover:text-gray-900 transition">Pricing</a>
          <a href="/dashboard" className="text-gray-500 hover:text-gray-900 transition">Dashboard</a>
          <a href="/auth/signin" className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
            Sign In
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div className="text-center pt-16 pb-10 px-4">
        <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-4 py-1.5 text-xs font-medium text-yellow-800 mb-6">
          ⚡ Blockchain-anchored proof in under 60 seconds
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          Prove you had an idea<br />
          <span className="text-yellow-500">at a specific time.</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          No lawyer. No crypto wallet required. Just your idea and 60 seconds.
          Get a tamper-proof, blockchain-anchored certificate instantly.
        </p>
      </div>

      {/* Core Interface */}
      <div className="flex-1 flex items-start justify-center px-4 pb-16">
        <MintInterface />
      </div>

      {/* Trust bar */}
      <div className="border-t border-gray-100 py-6 px-6">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-8 text-xs text-gray-400 font-medium">
          <span>🔗 Polygon Mainnet</span>
          <span>📌 IPFS Storage</span>
          <span>🔐 keccak256 Hash</span>
          <span>📄 PDF Certificate</span>
          <span>⚡ &lt;$0.01 per mint</span>
        </div>
      </div>
    </main>
  );
}
