import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IP Mint — Prove You Had an Idea First",
  description:
    "Blockchain-anchored proof of existence for your ideas. No lawyer, no crypto wallet required. 60 seconds, less than $10/month.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://ipmint.io"),
  openGraph: {
    title: "IP Mint — Prove You Had an Idea First",
    description:
      "Tamper-proof, blockchain-anchored certificates for your ideas. In under 60 seconds.",
    siteName: "IP Mint",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IP Mint — Prove You Had an Idea First",
    description: "Blockchain-anchored proof of existence. 60 seconds. Less than $10/month.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
