# IP Mint 🔐

**Prove you had an idea at a specific time.**

Blockchain-anchored proof of existence for ideas, designs, lyrics, code — anything.
No crypto wallet required for end users. Under 60 seconds. Less than $10/month.

---

## What it does

1. User types an idea (or drops a file)
2. We hash it with keccak256
3. Upload metadata to IPFS via Pinata
4. Mint an NFT on Polygon (platform covers gas)
5. Generate a beautiful PDF certificate
6. Anyone can verify at `/verify/[tokenId]` — no login required

---

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS**
- **Ethers.js v6** — blockchain interaction
- **Polygon Mainnet** — NFT minting (<$0.01/mint)
- **Pinata** — IPFS metadata storage
- **PostgreSQL** (Supabase) — users, mints, subscriptions
- **NextAuth.js** — wallet + email magic link auth
- **Stripe** — subscriptions
- **Puppeteer** — PDF certificate generation

---

## Setup Guide (30–45 min)

### 1. Clone & Install

```bash
git clone <your-repo>
cd ip-mint
npm install
```

### 2. Supabase (Database)

1. Go to [supabase.com](https://supabase.com) → New project
2. Settings → Database → Connection string (URI) → copy it
3. Run the schema:
   ```
   Settings → SQL Editor → paste contents of db/schema.sql → Run
   ```

### 3. Pinata (IPFS)

1. Go to [app.pinata.cloud](https://app.pinata.cloud) → Sign up (free)
2. API Keys → New Key → check "pinFileToIPFS" and "pinJSONToIPFS"
3. Copy API Key, Secret, and JWT

### 4. Deploy the Smart Contract

```bash
# Add your deployer wallet private key to .env.local first
npm run deploy:testnet    # Deploy to Mumbai testnet first
# → copy the contract address it prints

npm run deploy:contract   # Deploy to Polygon Mainnet when ready
```

> **Deployer wallet needs MATIC for gas** (~$1 worth covers thousands of mints).
> Buy MATIC on Coinbase → send to your deployer wallet address.

### 5. Stripe

1. [dashboard.stripe.com](https://dashboard.stripe.com) → Products → Create 3 products:
   - **Creator** — $9.99/month recurring
   - **Founder** — $29/month recurring
   - **Agency** — $99/month recurring
2. Copy each **Price ID** (starts with `price_`)
3. Developers → API Keys → copy Secret Key and Publishable Key
4. Developers → Webhooks → Add endpoint:
   - URL: `https://yourdomain.com/api/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy Webhook Secret

### 6. WalletConnect

1. [cloud.walletconnect.com](https://cloud.walletconnect.com) → New Project
2. Copy the Project ID

### 7. Environment Variables

```bash
cp .env.example .env.local
# Fill in all values
```

Key values to set:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=     # From step 4
DEPLOYER_PRIVATE_KEY=             # Your deployer wallet private key
DATABASE_URL=                     # From Supabase
PINATA_JWT=                       # From Pinata
STRIPE_SECRET_KEY=                # From Stripe
STRIPE_CREATOR_PRICE_ID=          # price_xxx from Stripe
NEXTAUTH_SECRET=                  # Run: openssl rand -base64 32
```

### 8. Run Locally

```bash
npm run dev
# → http://localhost:3000
```

### 9. Deploy to Vercel

```bash
npm install -g vercel
vercel
# Follow prompts → add all env vars in Vercel dashboard
```

Or: push to GitHub → import at [vercel.com/new](https://vercel.com/new) → add env vars → deploy.

---

## Project Structure

```
ip-mint/
├── app/
│   ├── page.tsx                    # Main mint interface
│   ├── verify/[tokenId]/page.tsx   # SSR verification page (SEO-optimized)
│   ├── dashboard/page.tsx          # User mint history
│   ├── account/page.tsx            # Subscription management
│   ├── pricing/page.tsx            # Pricing page
│   └── api/
│       ├── hash/route.ts           # keccak256 hashing + duplicate check
│       ├── mint/route.ts           # Full mint flow (IPFS + contract + DB)
│       ├── verify/route.ts         # Verify by tokenId or hash
│       ├── mints/route.ts          # User's mint history
│       ├── certificate/[tokenId]/  # PDF certificate generation
│       └── subscription/           # Stripe checkout + status + portal
├── components/
│   ├── MintInterface.tsx           # Core mint UI (single screen)
│   ├── MintStatus.tsx              # All 13 UX states
│   ├── ProofDisplay.tsx            # Success state + certificate
│   ├── WalletConnect.tsx           # MetaMask + signature auth
│   ├── VerificationCard.tsx        # /verify page component
│   ├── PricingTable.tsx            # Interactive pricing
│   └── Dashboard/
│       ├── MintHistory.tsx
│       └── CertificateCard.tsx
├── lib/
│   ├── hash.ts                     # keccak256 hashing
│   ├── ipfs.ts                     # Pinata upload functions
│   ├── blockchain.ts               # Ethers.js contract interactions
│   ├── db.ts                       # PostgreSQL client + helpers
│   ├── stripe.ts                   # Stripe helpers + plan config
│   ├── certificate.ts              # PDF HTML template
│   └── auth.ts                     # NextAuth config (wallet + email)
├── contracts/
│   └── IPMint.sol                  # ERC721 smart contract
├── scripts/
│   └── deploy.ts                   # Hardhat deployment
└── db/
    └── schema.sql                  # PostgreSQL schema
```

---

## Mint Flow

```
User input (text or file)
  → POST /api/hash → keccak256 hash + duplicate check
  → POST /api/mint
      → Check mint limit (plan-based)
      → Upload metadata to IPFS (Pinata)
      → mintIP(hash, ipfsURI) on Polygon
      → Store record in DB
      → Return tokenId + txHash
  → Show ProofDisplay (success state)
  → PDF available at /api/certificate/[tokenId]
```

---

## UX States (all handled)

| State | What happens |
|---|---|
| `idle` | Empty input |
| `checking` | Hashing + duplicate check |
| `duplicate` | Show existing proof (no charge) |
| `uploading` | IPFS upload in progress |
| `minting` | Blockchain TX pending |
| `success` | Certificate shown + confetti |
| `wallet_rejected` | Clean cancel message |
| `network_mismatch` | Prompt to switch to Polygon |
| `ipfs_failed` | Error — nothing saved |
| `contract_failed` | Error — nothing saved |
| `limit_reached` | Upgrade prompt |

---

## Plans & Pricing

| Plan | Price | Mints/month |
|---|---|---|
| Free | $0 | 1 |
| Creator | $9.99 | 10 |
| Founder | $29 | 50 |
| Agency | $99 | 500 |

Platform covers all gas fees for paid tiers.

---

## Growth Loops

1. **Verification Share** — Every `/verify/[tokenId]` page has a "Mint Your Own Idea" CTA
2. **Social Share** — Twitter/LinkedIn share built into success screen
3. **Dispute Use Case** — When ideas get stolen, users share their certificate publicly

---

## Legal Disclaimer

IP Mint certificates constitute cryptographic proof of existence at a specific timestamp.
They do not constitute a patent, trademark, or copyright registration.
They may be used as supporting evidence of prior creation.
Users should consult a licensed IP attorney for full legal protection.

---

## License

MIT
