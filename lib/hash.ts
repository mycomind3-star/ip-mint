import { keccak256, toUtf8Bytes } from "ethers";

/**
 * Hash a text string using keccak256.
 * Normalizes whitespace and lowercases before hashing
 * so minor formatting differences don't produce different hashes.
 */
export function hashText(text: string): string {
  const normalized = text.trim().replace(/\s+/g, " ");
  return keccak256(toUtf8Bytes(normalized));
}

/**
 * Hash raw bytes (for file uploads).
 * Pass in the ArrayBuffer from a FileReader.
 */
export function hashBytes(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return keccak256(bytes);
}

/**
 * Hash a Buffer (server-side file uploads).
 */
export function hashBuffer(buffer: Buffer): string {
  return keccak256(buffer);
}

/**
 * Convert a hex hash string (0x...) to bytes32 for the contract.
 */
export function hashToBytes32(hash: string): string {
  // ethers keccak256 already returns 0x-prefixed 32-byte hex
  return hash;
}

/**
 * Get a short preview of the hash for display (first 6 + last 4 chars).
 */
export function shortHash(hash: string): string {
  if (!hash || hash.length < 12) return hash;
  return `${hash.slice(0, 8)}...${hash.slice(-4)}`;
}
