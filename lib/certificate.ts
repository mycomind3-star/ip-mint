import { Mint } from "./db";
import { getTxExplorerUrl } from "./blockchain";
import { ipfsToHttp } from "./ipfs";

export interface CertificateData {
  tokenId: number;
  ownerAddress: string;
  contentPreview: string;
  contentHash: string;
  txHash: string;
  ipfsUri: string;
  network: string;
  timestamp: Date;
  appUrl: string;
}

/**
 * Generates an HTML string for the certificate.
 * Puppeteer will render this to PDF.
 */
export function buildCertificateHTML(data: CertificateData): string {
  const {
    tokenId,
    ownerAddress,
    contentPreview,
    contentHash,
    txHash,
    ipfsUri,
    network,
    timestamp,
    appUrl,
  } = data;

  const networkLabels: Record<string, string> = {
    polygon: "Polygon Mainnet",
    mumbai: "Polygon Mumbai (Testnet)",
    base: "Base Mainnet",
  };

  const humanTimestamp = timestamp.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });

  const unixTimestamp = Math.floor(timestamp.getTime() / 1000);
  const explorerUrl = getTxExplorerUrl(txHash, network);
  const verifyUrl = `${appUrl}/verify/${tokenId}`;
  const ipfsHttp = ipfsToHttp(ipfsUri);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>IP Mint Certificate #${tokenId}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
      background: #fff;
      color: #111;
      padding: 60px;
      min-height: 100vh;
    }

    .page {
      max-width: 740px;
      margin: 0 auto;
      border: 2px solid #111;
      padding: 56px;
      position: relative;
    }

    .corner {
      position: absolute;
      width: 20px;
      height: 20px;
      border-color: #D4AF37;
      border-style: solid;
    }
    .corner-tl { top: -2px; left: -2px; border-width: 3px 0 0 3px; }
    .corner-tr { top: -2px; right: -2px; border-width: 3px 3px 0 0; }
    .corner-bl { bottom: -2px; left: -2px; border-width: 0 0 3px 3px; }
    .corner-br { bottom: -2px; right: -2px; border-width: 0 3px 3px 0; }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 36px;
    }

    .logo {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #111;
    }

    .logo span {
      color: #D4AF37;
    }

    .seal {
      width: 72px;
      height: 72px;
      border: 3px solid #D4AF37;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      font-size: 9px;
      font-weight: 700;
      color: #D4AF37;
      letter-spacing: 0.06em;
      text-align: center;
      line-height: 1.4;
    }

    .title-block {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 1px solid #e5e5e5;
      padding-bottom: 32px;
    }

    .title-block h1 {
      font-size: 13px;
      letter-spacing: 0.2em;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .title-block h2 {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: #111;
    }

    .idea-preview {
      background: #f9f9f9;
      border-left: 4px solid #D4AF37;
      padding: 16px 20px;
      margin-bottom: 32px;
      font-size: 15px;
      font-style: italic;
      color: #333;
      line-height: 1.6;
    }

    .fields {
      display: grid;
      gap: 16px;
      margin-bottom: 32px;
    }

    .field {
      display: grid;
      grid-template-columns: 160px 1fr;
      gap: 12px;
      align-items: start;
      padding-bottom: 16px;
      border-bottom: 1px solid #f0f0f0;
    }

    .field:last-child { border-bottom: none; }

    .field-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: #999;
      text-transform: uppercase;
      padding-top: 2px;
    }

    .field-value {
      font-size: 13px;
      color: #111;
      word-break: break-all;
      font-family: 'Courier New', monospace;
    }

    .field-value.normal {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
    }

    .field-value a {
      color: #111;
      text-decoration: underline;
    }

    .status-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      background: #f0faf0;
      border: 1px solid #22c55e;
      border-radius: 4px;
      padding: 14px;
      margin-bottom: 32px;
    }

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #22c55e;
    }

    .status-text {
      font-size: 13px;
      font-weight: 600;
      color: #166534;
      letter-spacing: 0.04em;
    }

    .qr-block {
      display: flex;
      align-items: center;
      gap: 20px;
      background: #fafafa;
      border: 1px solid #e5e5e5;
      padding: 20px;
      margin-bottom: 32px;
    }

    .qr-placeholder {
      width: 80px;
      height: 80px;
      border: 1px solid #ccc;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: #999;
      flex-shrink: 0;
    }

    .qr-text {
      font-size: 12px;
      color: #666;
      line-height: 1.6;
    }

    .qr-text strong {
      display: block;
      font-size: 13px;
      color: #111;
      margin-bottom: 4px;
    }

    .qr-text a {
      font-family: 'Courier New', monospace;
      color: #111;
      font-size: 12px;
    }

    .disclaimer {
      font-size: 9.5px;
      color: #999;
      line-height: 1.7;
      text-align: center;
      border-top: 1px solid #e5e5e5;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>

    <div class="header">
      <div class="logo">IP<span>MINT</span></div>
      <div class="seal">
        <div>✓</div>
        <div>VERIFIED</div>
        <div>ON-CHAIN</div>
      </div>
    </div>

    <div class="title-block">
      <h1>Certificate of</h1>
      <h2>Proof of Existence</h2>
    </div>

    <div class="idea-preview">
      "${contentPreview.slice(0, 160)}${contentPreview.length > 160 ? "..." : ""}"
    </div>

    <div class="status-bar">
      <div class="status-dot"></div>
      <div class="status-text">VERIFIED ON-CHAIN — TOKEN #${tokenId}</div>
    </div>

    <div class="fields">
      <div class="field">
        <div class="field-label">Token ID</div>
        <div class="field-value normal">#${tokenId}</div>
      </div>
      <div class="field">
        <div class="field-label">Owner</div>
        <div class="field-value">${ownerAddress}</div>
      </div>
      <div class="field">
        <div class="field-label">Timestamp</div>
        <div class="field-value normal">${humanTimestamp} (Unix: ${unixTimestamp})</div>
      </div>
      <div class="field">
        <div class="field-label">Content Hash</div>
        <div class="field-value">${contentHash}</div>
      </div>
      <div class="field">
        <div class="field-label">Network</div>
        <div class="field-value normal">${networkLabels[network] || network}</div>
      </div>
      <div class="field">
        <div class="field-label">Transaction</div>
        <div class="field-value"><a href="${explorerUrl}">${txHash}</a></div>
      </div>
      <div class="field">
        <div class="field-label">IPFS Metadata</div>
        <div class="field-value"><a href="${ipfsHttp}">${ipfsUri}</a></div>
      </div>
    </div>

    <div class="qr-block">
      <div class="qr-placeholder">QR</div>
      <div class="qr-text">
        <strong>Verify this certificate</strong>
        Scan or visit the link below to independently verify this proof on the blockchain.
        <br />
        <a href="${verifyUrl}">${verifyUrl}</a>
      </div>
    </div>

    <div class="disclaimer">
      This certificate constitutes cryptographic proof that the described content existed at the stated timestamp.
      It does not constitute a patent, trademark, or copyright registration.
      It may be used as supporting evidence of prior creation. Consult a licensed IP attorney for full legal protection.
      <br />
      Issued by IP Mint &mdash; ipmint.io &mdash; Token #${tokenId}
    </div>
  </div>
</body>
</html>`;
}

export function mintToCertificateData(
  mint: Mint,
  ownerAddress: string
): CertificateData {
  return {
    tokenId: mint.token_id,
    ownerAddress,
    contentPreview: mint.content_preview,
    contentHash: mint.content_hash,
    txHash: mint.tx_hash,
    ipfsUri: mint.ipfs_uri,
    network: mint.network,
    timestamp: new Date(mint.created_at),
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://ipmint.io",
  };
}
