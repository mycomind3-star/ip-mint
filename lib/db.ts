import { Pool } from "pg";

// Singleton pool for serverless environments
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const pool = getPool();
  const result = await pool.query(sql, params);
  return result.rows as T[];
}

// ── User helpers ──────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string | null;
  wallet_address: string | null;
  stripe_customer_id: string | null;
  plan: "free" | "creator" | "founder" | "agency";
  mints_used: number;
  mints_reset_date: string;
  created_at: string;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const rows = await query<User>("SELECT * FROM users WHERE email = $1", [email]);
  return rows[0] ?? null;
}

export async function getUserByWallet(wallet: string): Promise<User | null> {
  const rows = await query<User>(
    "SELECT * FROM users WHERE LOWER(wallet_address) = LOWER($1)",
    [wallet]
  );
  return rows[0] ?? null;
}

export async function getUserById(id: string): Promise<User | null> {
  const rows = await query<User>("SELECT * FROM users WHERE id = $1", [id]);
  return rows[0] ?? null;
}

export async function upsertUser(data: Partial<User>): Promise<User> {
  const rows = await query<User>(
    `INSERT INTO users (email, wallet_address, plan, mints_used, mints_reset_date)
     VALUES ($1, $2, 'free', 0, NOW() + INTERVAL '1 month')
     ON CONFLICT (email) DO UPDATE SET wallet_address = EXCLUDED.wallet_address
     RETURNING *`,
    [data.email ?? null, data.wallet_address ?? null]
  );
  return rows[0];
}

export const PLAN_LIMITS: Record<string, number> = {
  free: 1,
  creator: 10,
  founder: 50,
  agency: 500,
};

export async function checkAndIncrementMints(userId: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  plan: string;
}> {
  // Reset counter if past reset date
  await query(
    `UPDATE users SET mints_used = 0, mints_reset_date = NOW() + INTERVAL '1 month'
     WHERE id = $1 AND mints_reset_date < NOW()`,
    [userId]
  );

  const users = await query<User>("SELECT * FROM users WHERE id = $1", [userId]);
  const user = users[0];
  if (!user) throw new Error("User not found");

  const limit = PLAN_LIMITS[user.plan] ?? 1;
  if (user.mints_used >= limit) {
    return { allowed: false, used: user.mints_used, limit, plan: user.plan };
  }

  await query("UPDATE users SET mints_used = mints_used + 1 WHERE id = $1", [userId]);
  return { allowed: true, used: user.mints_used + 1, limit, plan: user.plan };
}

// ── Mint helpers ──────────────────────────────────────────────────────────────

export interface Mint {
  id: string;
  user_id: string;
  token_id: number;
  content_hash: string;
  content_preview: string;
  content_type: "text" | "file";
  ipfs_uri: string;
  tx_hash: string;
  network: string;
  is_private: boolean;
  created_at: string;
}

export async function createMintRecord(data: Omit<Mint, "id" | "created_at">): Promise<Mint> {
  const rows = await query<Mint>(
    `INSERT INTO mints
       (user_id, token_id, content_hash, content_preview, content_type,
        ipfs_uri, tx_hash, network, is_private)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      data.user_id,
      data.token_id,
      data.content_hash,
      data.content_preview,
      data.content_type,
      data.ipfs_uri,
      data.tx_hash,
      data.network,
      data.is_private,
    ]
  );
  return rows[0];
}

export async function getMintByTokenId(tokenId: number): Promise<Mint | null> {
  const rows = await query<Mint>("SELECT * FROM mints WHERE token_id = $1", [tokenId]);
  return rows[0] ?? null;
}

export async function getMintsByUserId(userId: string): Promise<Mint[]> {
  return query<Mint>(
    "SELECT * FROM mints WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
}
