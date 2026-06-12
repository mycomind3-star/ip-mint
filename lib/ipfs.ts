const PINATA_JWT = process.env.PINATA_JWT!;
const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs";

export interface MintMetadata {
  name: string;
  description: string;
  contentHash: string;
  contentPreview: string;
  contentType: "text" | "file";
  fileName?: string;
  fileSize?: number;
  owner: string;
  timestamp: number;
  timestampHuman: string;
  network: string;
}

/**
 * Upload JSON metadata to IPFS via Pinata.
 * Returns the ipfs:// URI.
 */
export async function uploadMetadataToIPFS(
  metadata: MintMetadata
): Promise<string> {
  const body = {
    pinataContent: metadata,
    pinataMetadata: {
      name: `ipmint-${metadata.contentHash.slice(0, 10)}-metadata.json`,
    },
    pinataOptions: { cidVersion: 1 },
  };

  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinata upload failed: ${err}`);
  }

  const data = await res.json();
  return `ipfs://${data.IpfsHash}`;
}

/**
 * Upload a file buffer to IPFS via Pinata.
 * Returns the ipfs:// URI.
 */
export async function uploadFileToIPFS(
  fileBuffer: Buffer,
  fileName: string
): Promise<string> {
  const formData = new FormData();
  const blob = new Blob([fileBuffer]);
  formData.append("file", blob, fileName);
  formData.append(
    "pinataMetadata",
    JSON.stringify({ name: `ipmint-${fileName}` })
  );
  formData.append(
    "pinataOptions",
    JSON.stringify({ cidVersion: 1 })
  );

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinata file upload failed: ${err}`);
  }

  const data = await res.json();
  return `ipfs://${data.IpfsHash}`;
}

/**
 * Convert an ipfs:// URI to a public HTTP gateway URL.
 */
export function ipfsToHttp(uri: string): string {
  if (uri.startsWith("ipfs://")) {
    return `${PINATA_GATEWAY}/${uri.slice(7)}`;
  }
  return uri;
}
