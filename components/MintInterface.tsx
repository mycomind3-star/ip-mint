"use client";

import { useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import MintStatus, { MintState } from "./MintStatus";
import ProofDisplay from "./ProofDisplay";
import WalletConnect from "./WalletConnect";

interface MintResult {
  tokenId: number;
  txHash: string;
  contentHash: string;
  ipfsUri: string;
  network: string;
  timestamp: string;
  contentPreview: string;
}

export default function MintInterface() {
  const { data: session } = useSession();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [mintState, setMintState] = useState<MintState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [mintResult, setMintResult] = useState<MintResult | null>(null);
  const [existingMint, setExistingMint] = useState<{
    tokenId: number;
    timestamp: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setText("");
    }
  }, []);

  const handleMint = async () => {
    if (!text.trim() && !file) return;

    setMintState("checking");
    setErrorMessage("");
    setExistingMint(null);

    try {
      // Step 1: Hash and check duplicate
      let hashRes: Response;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        hashRes = await fetch("/api/hash", { method: "POST", body: formData });
      } else {
        hashRes = await fetch("/api/hash", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
      }

      const hashData = await hashRes.json();

      if (hashData.alreadyMinted) {
        setExistingMint({
          tokenId: hashData.existingTokenId,
          timestamp: hashData.existingTimestamp,
        });
        setMintState("duplicate");
        return;
      }

      // Step 2: Upload to IPFS
      setMintState("uploading");

      // Step 3: Mint on-chain
      setMintState("minting");

      let mintRes: Response;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("private", String(isPrivate));
        mintRes = await fetch("/api/mint", { method: "POST", body: formData });
      } else {
        mintRes = await fetch("/api/mint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, private: isPrivate }),
        });
      }

      if (mintRes.status === 429) {
        setMintState("limit_reached");
        return;
      }

      if (mintRes.status === 409) {
        const data = await mintRes.json();
        setExistingMint({ tokenId: data.tokenId, timestamp: data.timestamp });
        setMintState("duplicate");
        return;
      }

      if (!mintRes.ok) {
        const data = await mintRes.json();
        if (data.error === "ipfs_failed") {
          setMintState("ipfs_failed");
        } else {
          setMintState("contract_failed");
          setErrorMessage(data.detail || "");
        }
        return;
      }

      const mintData = await mintRes.json();
      const mint = mintData.mint;

      setMintResult({
        tokenId: mint.token_id,
        txHash: mint.tx_hash,
        contentHash: mint.content_hash,
        ipfsUri: mint.ipfs_uri,
        network: mint.network,
        timestamp: mint.created_at,
        contentPreview: mint.content_preview,
      });
      setMintState("success");
    } catch (err) {
      console.error("Mint error:", err);
      setMintState("contract_failed");
      setErrorMessage("Network error — please try again.");
    }
  };

  const resetForm = () => {
    setText("");
    setFile(null);
    setMintState("idle");
    setMintResult(null);
    setExistingMint(null);
    setErrorMessage("");
  };

  if (mintState === "success" && mintResult) {
    return <ProofDisplay result={mintResult} onMintAnother={resetForm} />;
  }

  return (
    <div className="w-full max-w-2xl">
      {/* Main card */}
      <div className="border border-gray-200 rounded-2xl p-8 shadow-sm bg-white">

        {/* Input area */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-6 transition-colors mb-6 ${
            isDragging
              ? "border-yellow-400 bg-yellow-50"
              : file
              ? "border-green-400 bg-green-50"
              : "border-gray-200 bg-gray-50 hover:border-gray-300"
          }`}
        >
          {file ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-lg">📎</div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                  <p className="text-gray-500 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕ Remove
              </button>
            </div>
          ) : (
            <>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Describe your idea — a business concept, song lyric, product design, screenplay treatment, software feature...

Or drop a file anywhere in this box."
                className="w-full bg-transparent resize-none outline-none text-gray-900 placeholder-gray-400 text-sm leading-relaxed min-h-[160px]"
                disabled={mintState !== "idle"}
              />
              <div className="flex items-center justify-between mt-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition"
                >
                  📎 Upload file instead
                </button>
                <span className={`text-xs ${text.length > 5000 ? "text-red-400" : "text-gray-400"}`}>
                  {text.length} chars
                </span>
              </div>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) { setFile(f); setText(""); }
            }}
          />
        </div>

        {/* Options row */}
        <div className="flex items-center justify-between mb-6">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="rounded"
            />
            Private (hide preview from verification page)
          </label>
          {!session && (
            <span className="text-xs text-gray-400">
              Sign in to save mint history
            </span>
          )}
        </div>

        {/* Status messages */}
        {mintState !== "idle" && mintState !== "success" && (
          <div className="mb-6">
            <MintStatus
              state={mintState}
              errorMessage={errorMessage}
              existingMint={existingMint}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {!session ? (
            <WalletConnect />
          ) : null}

          <button
            onClick={handleMint}
            disabled={
              (!text.trim() && !file) ||
              mintState === "checking" ||
              mintState === "uploading" ||
              mintState === "minting"
            }
            className={`flex-1 py-3.5 px-6 rounded-xl font-semibold text-sm transition-all ${
              (!text.trim() && !file) ||
              mintState === "checking" ||
              mintState === "uploading" ||
              mintState === "minting"
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800 active:scale-[0.98]"
            }`}
          >
            {mintState === "checking"
              ? "Checking..."
              : mintState === "uploading"
              ? "Uploading to IPFS..."
              : mintState === "minting"
              ? "Recording on blockchain..."
              : "Mint My Idea →"}
          </button>
        </div>

        {mintState === "limit_reached" && (
          <div className="mt-4 text-center">
            <a
              href="/pricing"
              className="inline-block bg-yellow-500 text-black font-semibold text-sm px-6 py-3 rounded-xl hover:bg-yellow-400 transition"
            >
              Upgrade to mint more →
            </a>
          </div>
        )}
      </div>

      {/* Social proof */}
      <p className="text-center text-xs text-gray-400 mt-4">
        Join 10,000+ creators, founders, and inventors who've protected their ideas.
      </p>
    </div>
  );
}
