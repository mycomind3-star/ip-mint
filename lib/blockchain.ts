import { ethers } from "ethers";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const RPC_URL = process.env.NEXT_PUBLIC_POLYGON_RPC_URL || "https://polygon-rpc.com";

// Minimal ABI — only what we need
const ABI = [
  "function mintIP(bytes32 ipHash, string memory metadataURI) public returns (uint256)",
  "function verifyIP(bytes32 ipHash) public view returns (bool exists, uint256 tokenId, uint256 timestamp)",
  "function getTokenInfo(uint256 tokenId) public view returns (address owner, bytes32 ipHash, string uri, uint256 timestamp)",
  "function tokenCounter() public view returns (uint256)",
  "event IPMinted(address indexed owner, uint256 indexed tokenId, bytes32 indexed ipHash, string tokenURI, uint256 timestamp)",
];

/**
 * Get a read-only provider (server-side or frontend).
 */
export function getProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(RPC_URL);
}

/**
 * Get a read-only contract instance (no signer — for server-side verification).
 */
export function getReadContract(): ethers.Contract {
  const provider = getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
}

/**
 * Get a write contract using the platform deployer wallet (server-side gas sponsorship).
 * Used for paid tiers where the platform covers gas.
 */
export function getWriteContract(): ethers.Contract {
  const provider = getProvider();
  const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY!, provider);
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
}

/**
 * Verify an IP hash exists on-chain (server-side read).
 */
export async function verifyHashOnChain(
  hash: string
): Promise<{ exists: boolean; tokenId: number; timestamp: number }> {
  const contract = getReadContract();
  const [exists, tokenId, timestamp] = await contract.verifyIP(hash);
  return {
    exists: Boolean(exists),
    tokenId: Number(tokenId),
    timestamp: Number(timestamp),
  };
}

/**
 * Get token info by token ID (server-side read).
 */
export async function getTokenInfo(tokenId: number): Promise<{
  owner: string;
  ipHash: string;
  uri: string;
  timestamp: number;
} | null> {
  try {
    const contract = getReadContract();
    const [owner, ipHash, uri, timestamp] = await contract.getTokenInfo(tokenId);
    return {
      owner: owner as string,
      ipHash: ipHash as string,
      uri: uri as string,
      timestamp: Number(timestamp),
    };
  } catch {
    return null;
  }
}

/**
 * Server-side mint (platform covers gas — for paid tiers).
 * Returns tx hash and token ID.
 */
export async function mintOnChain(
  ipHash: string,
  metadataURI: string
): Promise<{ txHash: string; tokenId: number }> {
  const contract = getWriteContract();
  const tx = await contract.mintIP(ipHash, metadataURI);
  const receipt = await tx.wait();

  // Parse tokenId from IPMinted event
  const iface = new ethers.Interface(ABI);
  let tokenId = 0;
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed?.name === "IPMinted") {
        tokenId = Number(parsed.args.tokenId);
        break;
      }
    } catch {}
  }

  return { txHash: receipt.hash, tokenId };
}

/**
 * Get the Polygon explorer URL for a tx hash.
 */
export function getTxExplorerUrl(txHash: string, network = "polygon"): string {
  const explorers: Record<string, string> = {
    polygon: "https://polygonscan.com/tx",
    mumbai: "https://mumbai.polygonscan.com/tx",
    base: "https://basescan.org/tx",
  };
  return `${explorers[network] || explorers.polygon}/${txHash}`;
}

export { CONTRACT_ADDRESS, ABI };
