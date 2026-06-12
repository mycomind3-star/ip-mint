import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hashText, hashBuffer } from "@/lib/hash";
import { uploadMetadataToIPFS, uploadFileToIPFS } from "@/lib/ipfs";
import { mintOnChain, verifyHashOnChain } from "@/lib/blockchain";
import {
  createMintRecord,
  checkAndIncrementMints,
  getUserByEmail,
  getUserByWallet,
} from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from DB
    const user =
      (await getUserByEmail(session.user.email!)) ||
      (session.user.walletAddress
        ? await getUserByWallet(session.user.walletAddress)
        : null);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const contentType = req.headers.get("content-type") || "";
    let hash: string;
    let preview: string;
    let type: "text" | "file";
    let fileName: string | undefined;
    let fileSize: number | undefined;
    let isPrivate = false;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }
      isPrivate = formData.get("private") === "true";
      const buffer = Buffer.from(await file.arrayBuffer());
      hash = hashBuffer(buffer);
      preview = `[File: ${file.name} — ${(file.size / 1024).toFixed(1)} KB]`;
      type = "file";
      fileName = file.name;
      fileSize = file.size;

      // Check duplicate
      const chainCheck = await verifyHashOnChain(hash);
      if (chainCheck.exists) {
        return NextResponse.json(
          {
            alreadyMinted: true,
            tokenId: chainCheck.tokenId,
            timestamp: chainCheck.timestamp,
          },
          { status: 409 }
        );
      }

      // Check mint limit
      const limitCheck = await checkAndIncrementMints(user.id);
      if (!limitCheck.allowed) {
        return NextResponse.json(
          { error: "mint_limit_reached", plan: limitCheck.plan, limit: limitCheck.limit },
          { status: 429 }
        );
      }

      // Upload file to IPFS first
      const fileIpfsUri = await uploadFileToIPFS(buffer, file.name);

      const metadata = {
        name: `IP Mint — ${file.name}`,
        description: preview,
        contentHash: hash,
        contentPreview: preview,
        contentType: type as "file",
        fileName,
        fileSize,
        fileIpfsUri,
        owner: session.user.walletAddress || session.user.email || "unknown",
        timestamp: Date.now(),
        timestampHuman: new Date().toISOString(),
        network: "polygon",
      };

      const ipfsUri = await uploadMetadataToIPFS(metadata);
      const { txHash, tokenId } = await mintOnChain(hash, ipfsUri);

      const mint = await createMintRecord({
        user_id: user.id,
        token_id: tokenId,
        content_hash: hash,
        content_preview: preview,
        content_type: type,
        ipfs_uri: ipfsUri,
        tx_hash: txHash,
        network: "polygon",
        is_private: isPrivate,
      });

      return NextResponse.json({ success: true, mint });
    } else {
      // Text input
      const body = await req.json();
      const { text, private: priv } = body;
      isPrivate = Boolean(priv);

      if (!text || typeof text !== "string" || text.trim().length === 0) {
        return NextResponse.json({ error: "Text is required" }, { status: 400 });
      }

      hash = hashText(text);
      preview = text.trim().slice(0, 80);
      type = "text";

      // Check duplicate
      const chainCheck = await verifyHashOnChain(hash);
      if (chainCheck.exists) {
        return NextResponse.json(
          {
            alreadyMinted: true,
            tokenId: chainCheck.tokenId,
            timestamp: chainCheck.timestamp,
          },
          { status: 409 }
        );
      }

      // Check mint limit
      const limitCheck = await checkAndIncrementMints(user.id);
      if (!limitCheck.allowed) {
        return NextResponse.json(
          { error: "mint_limit_reached", plan: limitCheck.plan, limit: limitCheck.limit },
          { status: 429 }
        );
      }

      // Upload metadata to IPFS
      const metadata = {
        name: `IP Mint — ${preview.slice(0, 40)}`,
        description: text.trim(),
        contentHash: hash,
        contentPreview: preview,
        contentType: type as "text",
        owner: session.user.walletAddress || session.user.email || "unknown",
        timestamp: Date.now(),
        timestampHuman: new Date().toISOString(),
        network: "polygon",
      };

      const ipfsUri = await uploadMetadataToIPFS(metadata);
      const { txHash, tokenId } = await mintOnChain(hash, ipfsUri);

      const mint = await createMintRecord({
        user_id: user.id,
        token_id: tokenId,
        content_hash: hash,
        content_preview: preview,
        content_type: type,
        ipfs_uri: ipfsUri,
        tx_hash: txHash,
        network: "polygon",
        is_private: isPrivate,
      });

      return NextResponse.json({ success: true, mint });
    }
  } catch (err: unknown) {
    console.error("/api/mint error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("already minted")) {
      return NextResponse.json({ error: "already_minted" }, { status: 409 });
    }
    if (message.includes("Pinata")) {
      return NextResponse.json({ error: "ipfs_failed" }, { status: 502 });
    }
    return NextResponse.json({ error: "mint_failed", detail: message }, { status: 500 });
  }
}
