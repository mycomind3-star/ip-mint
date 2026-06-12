import { Metadata } from "next";
import VerificationCard from "@/components/VerificationCard";

interface Props {
  params: { tokenId: string };
}

async function getVerificationData(tokenId: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${appUrl}/api/verify?tokenId=${tokenId}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getVerificationData(params.tokenId);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ipmint.io";

  const title = data?.exists
    ? `IP Mint Certificate #${params.tokenId} — Verified`
    : `IP Mint — Not Found`;

  const description = data?.exists
    ? `Blockchain proof minted on ${data.timestampHuman}. ${
        data.contentPreview && !data.isPrivate
          ? `"${data.contentPreview.slice(0, 80)}..."`
          : "Content is private."
      }`
    : "This IP Mint token could not be found.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${appUrl}/verify/${params.tokenId}`,
      siteName: "IP Mint",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function VerifyPage({ params }: Props) {
  const data = await getVerificationData(params.tokenId);

  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <a href="/" className="text-xl font-bold tracking-wide">
          IP<span className="text-yellow-500">MINT</span>
        </a>
        <a
          href="/"
          className="text-sm text-gray-500 hover:text-gray-900 transition"
        >
          Mint Your Own Idea →
        </a>
      </nav>

      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verification Certificate
          </h1>
          <p className="text-gray-500 text-sm">
            Independently verified against the blockchain.
          </p>
        </div>

        <VerificationCard data={data || { exists: false }} />

        <p className="text-center text-xs text-gray-400 mt-6 max-w-sm mx-auto">
          This certificate constitutes cryptographic proof of existence at the stated timestamp.
          It does not constitute a patent, trademark, or copyright.
        </p>
      </div>
    </main>
  );
}
