import { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { query, getUserByEmail, upsertUser } from "@/lib/db";
import { ethers } from "ethers";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      walletAddress?: string | null;
      plan?: string;
    };
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    // Email magic link
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM || "noreply@ipmint.io",
    }),

    // Wallet login via signed message
    CredentialsProvider({
      id: "wallet",
      name: "Wallet",
      credentials: {
        address: { label: "Wallet Address", type: "text" },
        signature: { label: "Signature", type: "text" },
        message: { label: "Message", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.address || !credentials?.signature || !credentials?.message) {
          return null;
        }

        try {
          // Verify the signature
          const recovered = ethers.verifyMessage(
            credentials.message,
            credentials.signature
          );

          if (recovered.toLowerCase() !== credentials.address.toLowerCase()) {
            return null;
          }

          // Upsert user
          const user = await upsertUser({ wallet_address: credentials.address });

          return {
            id: user.id,
            walletAddress: credentials.address,
            email: user.email,
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "email" && user.email) {
        await upsertUser({ email: user.email });
      }
      return true;
    },

    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      if (token.walletAddress) {
        session.user.walletAddress = token.walletAddress as string;
      }

      // Attach plan
      if (session.user.email) {
        const dbUser = await getUserByEmail(session.user.email);
        if (dbUser) {
          session.user.plan = dbUser.plan;
          session.user.id = dbUser.id;
        }
      }

      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        // @ts-ignore
        if (user.walletAddress) token.walletAddress = user.walletAddress;
      }
      return token;
    },
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  adapter: {
    // Custom minimal adapter using our DB
    async createUser(user) {
      const rows = await query(
        `INSERT INTO users (email, plan, mints_used, mints_reset_date)
         VALUES ($1, 'free', 0, NOW() + INTERVAL '1 month')
         ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
         RETURNING *`,
        [user.email]
      );
      return { ...rows[0], id: rows[0].id, emailVerified: null };
    },
    async getUser(id) {
      const rows = await query("SELECT * FROM users WHERE id = $1", [id]);
      return rows[0] ? { ...rows[0], emailVerified: null } : null;
    },
    async getUserByEmail(email) {
      const rows = await query("SELECT * FROM users WHERE email = $1", [email]);
      return rows[0] ? { ...rows[0], emailVerified: null } : null;
    },
    async getUserByAccount({ providerAccountId, provider }) {
      const rows = await query(
        "SELECT u.* FROM users u JOIN accounts a ON u.id = a.user_id WHERE a.provider = $1 AND a.provider_account_id = $2",
        [provider, providerAccountId]
      );
      return rows[0] ? { ...rows[0], emailVerified: null } : null;
    },
    async updateUser(user) {
      const rows = await query(
        "UPDATE users SET email = $1 WHERE id = $2 RETURNING *",
        [user.email, user.id]
      );
      return { ...rows[0], emailVerified: null };
    },
    async linkAccount(account) {
      await query(
        `INSERT INTO accounts (user_id, provider, provider_account_id, type, access_token, refresh_token)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        [
          account.userId,
          account.provider,
          account.providerAccountId,
          account.type,
          account.access_token,
          account.refresh_token,
        ]
      );
      return account;
    },
    async createSession(session) {
      await query(
        `INSERT INTO sessions (user_id, session_token, expires)
         VALUES ((SELECT id FROM users WHERE email = $1), $2, $3)`,
        [session.userId, session.sessionToken, session.expires]
      );
      return session;
    },
    async getSessionAndUser(sessionToken) {
      const rows = await query(
        "SELECT s.*, u.* FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.session_token = $1",
        [sessionToken]
      );
      if (!rows[0]) return null;
      const r = rows[0] as Record<string, unknown>;
      return {
        session: { sessionToken, userId: r.user_id as string, expires: r.expires as Date },
        user: { ...r, id: r.user_id as string, emailVerified: null },
      };
    },
    async updateSession(session) {
      await query("UPDATE sessions SET expires = $1 WHERE session_token = $2", [
        session.expires,
        session.sessionToken,
      ]);
      return session;
    },
    async deleteSession(sessionToken) {
      await query("DELETE FROM sessions WHERE session_token = $1", [sessionToken]);
    },
  } as NextAuthOptions["adapter"],
};
