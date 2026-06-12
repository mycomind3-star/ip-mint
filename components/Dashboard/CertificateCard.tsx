"use client";

interface CertificateCardProps {
  tokenId: number;
  contentPreview: string;
  contentHash: string;
  txHash: string;
  network: string;
  timestamp: string;
  isPrivate: boolean;
}

export default function CertificateCard({
  tokenId,
  contentPreview,
  contentHash,
  txHash,
  network,
  timestamp,
  isPrivate,
}: CertificateCardProps) {
  const shortHash = (h: string) =>
    h ? `${h.slice(0, 8)}...${h.slice(-4)}` : "";

  return (
    <div className="border-2 border-black rounded-xl overflow-hidden">
      {/* Gold header */}
      <div className="bg-yellow-400 px-4 py-2 flex items-center justify-between">
        <span className="font-bold text-xs tracking-wide text-black">
          IPMINT
        </span>
        <span className="text-xs font-semibold text-black tracking-widest uppercase">
          Proof of Existence
        </span>
        <span className="text-xs font-mono text-black">#{tokenId}</span>
      </div>

      <div className="p-4 bg-white">
        {/* Preview */}
        <div className="bg-gray-50 rounded-lg px-3 py-2 mb-4 text-xs italic text-gray-600">
          {isPrivate ? "🔒 Private" : `"${contentPreview}"`}
        </div>

        {/* Key fields */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400 uppercase tracking-wider">Token</span>
            <span className="font-mono font-semibold">#{tokenId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 uppercase tracking-wider">Timestamp</span>
            <span className="font-medium">
              {new Date(timestamp).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 uppercase tracking-wider">Hash</span>
            <span className="font-mono">{shortHash(contentHash)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 uppercase tracking-wider">Network</span>
            <span className="capitalize">{network}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <a
            href={`/verify/${tokenId}`}
            className="flex-1 text-center text-xs border border-gray-200 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition"
          >
            Verify
          </a>
          <a
            href={`/api/certificate/${tokenId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-xs bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
          >
            Download PDF
          </a>
        </div>
      </div>
    </div>
  );
}
