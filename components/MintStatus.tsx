"use client";

export type MintState =
  | "idle"
  | "checking"
  | "duplicate"
  | "uploading"
  | "awaiting_signature"
  | "minting"
  | "success"
  | "wallet_rejected"
  | "network_mismatch"
  | "ipfs_failed"
  | "contract_failed"
  | "limit_reached";

interface MintStatusProps {
  state: MintState;
  errorMessage?: string;
  existingMint?: { tokenId: number; timestamp: number } | null;
}

export default function MintStatus({ state, errorMessage, existingMint }: MintStatusProps) {
  const configs: Partial<Record<MintState, { icon: string; message: string; sub?: string; color: string }>> = {
    checking: {
      icon: "⏳",
      message: "Checking if this idea exists...",
      color: "bg-blue-50 border-blue-200 text-blue-800",
    },
    duplicate: {
      icon: "ℹ️",
      message: existingMint
        ? `This exact idea was already minted on ${new Date(existingMint.timestamp * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`
        : "This exact idea was already minted.",
      sub: existingMint ? `Token #${existingMint.tokenId} · No charge applied.` : undefined,
      color: "bg-blue-50 border-blue-200 text-blue-800",
    },
    uploading: {
      icon: "🔒",
      message: "Securing your idea on IPFS...",
      sub: "This takes a few seconds.",
      color: "bg-yellow-50 border-yellow-200 text-yellow-800",
    },
    awaiting_signature: {
      icon: "🔑",
      message: "Approve in your wallet",
      sub: "Check your wallet extension or app.",
      color: "bg-yellow-50 border-yellow-200 text-yellow-800",
    },
    minting: {
      icon: "⛓️",
      message: "Recording on blockchain...",
      sub: "Usually completes in 5–15 seconds.",
      color: "bg-yellow-50 border-yellow-200 text-yellow-800",
    },
    wallet_rejected: {
      icon: "⚠️",
      message: "Transaction cancelled — nothing was saved.",
      sub: "You can try again whenever you're ready.",
      color: "bg-orange-50 border-orange-200 text-orange-800",
    },
    network_mismatch: {
      icon: "🔄",
      message: "Wrong network — please switch to Polygon in your wallet.",
      sub: "Open your wallet and select Polygon Mainnet.",
      color: "bg-orange-50 border-orange-200 text-orange-800",
    },
    ipfs_failed: {
      icon: "❌",
      message: "Upload failed — nothing was saved. Please try again.",
      sub: "The IPFS network may be temporarily unavailable.",
      color: "bg-red-50 border-red-200 text-red-800",
    },
    contract_failed: {
      icon: "❌",
      message: `Blockchain error — nothing was saved. Try again.`,
      sub: errorMessage || undefined,
      color: "bg-red-50 border-red-200 text-red-800",
    },
    limit_reached: {
      icon: "🚀",
      message: "You've used all your mints this month.",
      sub: "Upgrade to unlock more.",
      color: "bg-gray-50 border-gray-200 text-gray-800",
    },
  };

  const config = configs[state];
  if (!config) return null;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${config.color}`}>
      <span className="text-xl flex-shrink-0">{config.icon}</span>
      <div>
        <p className="font-medium text-sm">{config.message}</p>
        {config.sub && (
          <p className="text-xs mt-0.5 opacity-75">{config.sub}</p>
        )}
        {state === "duplicate" && existingMint && (
          <a
            href={`/verify/${existingMint.tokenId}`}
            className="text-xs underline mt-1 inline-block"
          >
            View existing proof →
          </a>
        )}
      </div>
    </div>
  );
}
