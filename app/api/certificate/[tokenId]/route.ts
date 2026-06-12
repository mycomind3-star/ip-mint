import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { getMintByTokenId, getUserById } from "@/lib/db";
import { getTokenInfo } from "@/lib/blockchain";
import { buildCertificateHTML, mintToCertificateData } from "@/lib/certificate";

export async function GET(
  req: NextRequest,
  { params }: { params: { tokenId: string } }
) {
  const tokenId = parseInt(params.tokenId);
  if (isNaN(tokenId)) {
    return NextResponse.json({ error: "Invalid token ID" }, { status: 400 });
  }

  try {
    const [mint, chainInfo] = await Promise.all([
      getMintByTokenId(tokenId),
      getTokenInfo(tokenId),
    ]);

    if (!mint || !chainInfo) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    const certData = mintToCertificateData(mint, chainInfo.owner);
    const html = buildCertificateHTML(certData);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
      printBackground: true,
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ipmint-certificate-${tokenId}.pdf"`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("/api/certificate error:", err);
    return NextResponse.json({ error: "Failed to generate certificate" }, { status: 500 });
  }
}
