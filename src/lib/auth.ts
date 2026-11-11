import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import { account, session, user, verification } from "@/lib/db/schema";

const secret = process.env.BETTER_AUTH_SECRET;
const baseURL = process.env.BETTER_AUTH_URL;
const trustedOrigins = new Set<string>();

if (!secret) {
  throw new Error("BETTER_AUTH_SECRET is required.");
}

if (baseURL) {
  const configuredOrigin = new URL(baseURL);
  trustedOrigins.add(configuredOrigin.origin);

  if (
    configuredOrigin.hostname === "localhost" ||
    configuredOrigin.hostname === "127.0.0.1"
  ) {
    configuredOrigin.hostname =
      configuredOrigin.hostname === "localhost" ? "127.0.0.1" : "localhost";
    trustedOrigins.add(configuredOrigin.origin);
  }
}

export const auth = betterAuth({
  appName: "Реестр подписей",
  secret,
  baseURL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  trustedOrigins: [...trustedOrigins],
});
