"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { ethers } from "ethers";

export default function WalletConnect() {
  const { data: session } = useSession();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  const connectWallet = async () => {
    setConnecting(true);
    setError("");

    try {
      if (typeof window.ethereum === "undefined") {
        setError("No wallet detected. Install MetaMask to continue.");
        setConnecting(false);
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];

      // Ensure Polygon network (chainId 137)
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== 137) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x89" }],
          });
        } catch (switchError: unknown) {
          if ((switchError as { code: number }).code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: "0x89",
                chainName: "Polygon Mainnet",
                nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
                rpcUrls: ["https://polygon-rpc.com/"],
                blockExplorerUrls: ["https://polygonscan.com/"],
              }],
            });
          }
        }
      }

      const signer = await provider.getSigner();
      const message = `Sign in to IP Mint\n\nWallet: ${address}\nTimestamp: ${Date.now()}`;
      const signature = await signer.signMessage(message);

      await signIn("wallet", {
        address,
        signature,
        message,
        redirect: false,
      });
    } catch (err: unknown) {
      if ((err as { code: number }).code === 4001) {
        setError("Signature rejected — connection cancelled.");
      } else {
        setError("Connection failed. Please try again.");
      }
    } finally {
      setConnecting(false);
    }
  };

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-xs font-mono text-green-800">
            {session.user.walletAddress
              ? `${session.user.walletAddress.slice(0, 6)}...${session.user.walletAddress.slice(-4)}`
              : session.user.email}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={connectWallet}
        disabled={connecting}
        className="py-3.5 px-5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-500 hover:bg-gray-50 transition flex items-center gap-2 whitespace-nowrap disabled:opacity-60"
      >
        <span>🦊</span>
        {connecting ? "Connecting..." : "Connect Wallet"}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
