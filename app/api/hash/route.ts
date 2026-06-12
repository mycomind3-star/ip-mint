import { NextRequest, NextResponse } from "next/server";
import { hashText, hashBuffer } from "@/lib/hash";
import { verifyHashOnChain } from "@/lib/blockchain";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let hash: string;
    let preview: string;
    let type: "text" | "file";

    if (contentType.includes("multipart/form-data")) {
      // File upload
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      hash = hashBuffer(buffer);
      preview = `[File: ${file.name} — ${(file.size / 1024).toFixed(1)} KB]`;
      type = "file";
    } else {
      // Text input
      const body = await req.json();
      const { text } = body;
      if (!text || typeof text !== "string" || text.trim().length === 0) {
        return NextResponse.json({ error: "Text is required" }, { status: 400 });
      }
      hash = hashText(text);
      preview = text.trim().slice(0, 80);
      type = "text";
    }

    // Check if this hash already exists on-chain
    const chainResult = await verifyHashOnChain(hash);

    return NextResponse.json({
      hash,
      preview,
      type,
      alreadyMinted: chainResult.exists,
      existingTokenId: chainResult.exists ? chainResult.tokenId : null,
      existingTimestamp: chainResult.exists ? chainResult.timestamp : null,
    });
  } catch (err) {
    console.error("/api/hash error:", err);
    return NextResponse.json(
      { error: "Failed to hash content" },
      { status: 500 }
    );
  }
}
