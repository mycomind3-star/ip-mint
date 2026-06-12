"use client";

interface VerificationData {
  exists: boolean;
  tokenId?: number;
  owner?: string;
  ipHash?: string;
  timestamp?: number;
  timestampHuman?: string;
  txHash?: string;
  explorerUrl?: string;
  ipfsHttp?: string;
  network?: string;
  contentPreview?: string | null;
  contentType?: string | null;
  isPrivate?: boolean;
}

export default function VerificationCard({ data }: { data: VerificationData }) {
  const shortHash = (h: string) => `${h.slice(0, 8)}...${h.slice(-4)}`;

  if (!data.exists) {
    return (
      <div className="border-2 border-red-200 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">❌</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Not Found</h2>
        <p className="text-gray-500 text-sm">
          This token does not exist on the blockchain, or could not be found.
        </p>
        <a
          href="/"
          className="inline-block mt-6 bg-black text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
        >
          Mint Your Own Idea →
        </a>
      </div>
    );
  }

  return (
    <div className="border-2 border-black rounded-2xl overflow-hidden">
      {/* Gold header */}
      <div className="bg-yellow-400 px-6 py-3 flex items-center justify-between">
        <span className="font-bold tracking-wide text-black text-sm">
          IP<span className="opacity-60">MINT</span>
        </span>
        <span className="text-xs font-semibold text-black tracking-widest uppercase">
          Proof of Existence
        </span>
        <span className="text-xs font-mono text-black">#{data.tokenId}</span>
      </div>

      <div className="p-6 bg-white">
        {/* Status badge */}
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 mb-5">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-green-800 text-sm font-semibold">✅ VERIFIED ON-CHAIN</span>
        </div>

        {/* Idea preview */}
        {data.contentPreview && !data.isPrivate ? (
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 mb-5 italic text-sm text-gray-700">
            "{data.contentPreview}"
          </div>
        ) : data.isPrivate ? (
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 mb-5 text-sm text-gray-400">
            🔒 Content is private — owner has hidden the preview.
          </div>
        ) : null}

        {/* Fields */}
        <div className="space-y-3">
          <div className="flex justify-between items-start text-sm border-b border-gray-50 pb-3">
            <span className="text-gray-400 text-xs uppercase tracking-wider font-medium">Token ID</span>
            <span className="font-mono font-semibold">#{data.tokenId}</span>
          </div>
          <div className="flex justify-between items-start text-sm border-b border-gray-50 pb-3">
            <span className="text-gray-400 text-xs uppercase tracking-wider font-medium">Owner</span>
            <span className="font-mono text-xs">
              {data.owner ? `${data.owner.slice(0, 6)}...${data.owner.slice(-4)}` : "—"}
            </span>
          </div>
          <div className="flex justify-between items-start text-sm border-b border-gray-50 pb-3">
            <span className="text-gray-400 text-xs uppercase tracking-wider font-medium">Timestamp</span>
            <span className="font-medium text-right text-xs">{data.timestampHuman}</span>
          </div>
          <div className="flex justify-between items-start text-sm border-b border-gray-50 pb-3">
            <span className="text-gray-400 text-xs uppercase tracking-wider font-medium">Content Hash</span>
            <span className="font-mono text-xs">{data.ipHash ? shortHash(data.ipHash) : "—"}</span>
          </div>
          <div className="flex justify-between items-start text-sm border-b border-gray-50 pb-3">
            <span className="text-gray-400 text-xs uppercase tracking-wider font-medium">Network</span>
            <span className="font-medium capitalize text-sm">{data.network} Mainnet</span>
          </div>
          {data.txHash && (
            <div className="flex justify-between items-start text-sm border-b border-gray-50 pb-3">
              <span className="text-gray-400 text-xs uppercase tracking-wider font-medium">Transaction</span>
              <a
                href={data.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-blue-600 hover:text-blue-800 underline"
              >
                {shortHash(data.txHash)} ↗
              </a>
            </div>
          )}
          {data.ipfsHttp && (
            <div className="flex justify-between items-start text-sm">
              <span className="text-gray-400 text-xs uppercase tracking-wider font-medium">IPFS Metadata</span>
              <a
                href={data.ipfsHttp}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                View on IPFS ↗
              </a>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 mb-3">Protect your own ideas in under 60 seconds</p>
          <a
            href="/"
            className="inline-block bg-black text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
          >
            Mint Your Own Idea →
          </a>
        </div>
      </div>
    </div>
  );
}
