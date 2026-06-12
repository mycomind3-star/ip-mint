import { NextRequest, NextResponse } from "next/server";
import { verifyHashOnChain, getTokenInfo } from "@/lib/blockchain";
import { getMintByTokenId } from "@/lib/db";
import { hashText } from "@/lib/hash";
import { ipfsToHttp } from "@/lib/ipfs";
import { getTxExplorerUrl } from "@/lib/blockchain";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tokenIdParam = searchParams.get("tokenId");
  const hashParam = searchParams.get("hash");
  const textParam = searchParams.get("text");

  try {
    let hash: string | null = hashParam;
    let tokenId: number | null = tokenIdParam ? parseInt(tokenIdParam) : null;

    // If text provided, hash it first
    if (!hash && textParam) {
      hash = hashText(textParam);
    }

    if (hash) {
      const chainResult = await verifyHashOnChain(hash);
      if (!chainResult.exists) {
        return NextResponse.json({ exists: false });
      }
      tokenId = chainResult.tokenId;
    }

    if (tokenId === null) {
      return NextResponse.json({ error: "Provide tokenId, hash, or text" }, { status: 400 });
    }

    const [chainInfo, dbMint] = await Promise.all([
      getTokenInfo(tokenId),
      getMintByTokenId(tokenId),
    ]);

    if (!chainInfo) {
      return NextResponse.json({ exists: false });
    }

    const isPrivate = dbMint?.is_private ?? false;

    return NextResponse.json({
      exists: true,
      tokenId,
      owner: chainInfo.owner,
      ipHash: chainInfo.ipHash,
      timestamp: chainInfo.timestamp,
      timestampHuman: new Date(chainInfo.timestamp * 1000).toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "UTC",
        timeZoneName: "short",
      }),
      uri: chainInfo.uri,
      ipfsHttp: ipfsToHttp(chainInfo.uri),
      txHash: dbMint?.tx_hash || null,
      explorerUrl: dbMint?.tx_hash ? getTxExplorerUrl(dbMint.tx_hash, dbMint.network) : null,
      network: dbMint?.network || "polygon",
      contentPreview: isPrivate ? null : dbMint?.content_preview || null,
      contentType: dbMint?.content_type || null,
      isPrivate,
    });
  } catch (err) {
    console.error("/api/verify error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
