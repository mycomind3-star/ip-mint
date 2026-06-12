"use client";

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

export default function MintHistory({ mints }: { mints: MintRecord[] }) {
  if (mints.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl">
        <div className="text-4xl mb-3">💡</div>
        <h3 className="font-semibold text-gray-900 mb-2">No mints yet</h3>
        <p className="text-gray-500 text-sm mb-6">
          Protect your first idea in 60 seconds.
        </p>
        <a
          href="/"
          className="bg-black text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
        >
          Mint My First Idea →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {mints.map((mint) => (
        <CertificateCard key={mint.id} mint={mint} />
      ))}
    </div>
  );
}

function CertificateCard({ mint }: { mint: MintRecord }) {
  const shortHash = (h: string) =>
    h ? `${h.slice(0, 8)}...${h.slice(-4)}` : "";

  return (
    <div className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Badges row */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium capitalize">
              {mint.content_type}
            </span>
            {mint.is_private && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                🔒 Private
              </span>
            )}
            <span className="text-xs text-gray-400 font-mono">
              #{mint.token_id}
            </span>
          </div>

          {/* Preview */}
          <p className="text-sm text-gray-900 font-medium truncate mb-1">
            {mint.content_preview}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>
              {new Date(mint.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="font-mono">{shortHash(mint.content_hash)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
          <a
            href={`/verify/${mint.token_id}`}
            className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 transition"
          >
            Verify
          </a>
          <a
            href={`/api/certificate/${mint.token_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 transition"
          >
            PDF ↓
          </a>
        </div>
      </div>
    </div>
  );
}
