import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { user, account, session, verification } from "@/db/auth-schema";

const getTrustedOrigins = () => {
  const origins = ["http://localhost:3000", "https://localhost:3000"];

  // Add the current baseURL
  if (process.env.BETTER_AUTH_URL) {
    origins.push(process.env.BETTER_AUTH_URL);
  }

  // Add common Vercel patterns
  origins.push("https://hci-project-rho.vercel.app");
  origins.push("https://hci-project-*.vercel.app");

  return origins;
};

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "dev-secret-change-in-production",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      account,
      session,
      verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      },
    },
  },
  advanced: {
    cookiePrefix: "better-auth",
  },
  trustedOrigins: getTrustedOrigins(),
});

// Type declarations for BetterAuth
export type BetterAuthSession = typeof auth.$Infer.Session;
export type BetterAuthUser = typeof auth.$Infer.User & {
  role: string;
};
