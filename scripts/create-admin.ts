import "dotenv/config";
import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { z } from "zod";
import { db, client } from "../src/lib/db/client";
import { account, user } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

const credentialsSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(14),
});

async function createAdmin() {
  const credentials = credentialsSchema.parse({
    name: process.env.ADMIN_NAME,
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  });
  const [existingUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, credentials.email))
    .limit(1);

  if (existingUser) {
    throw new Error("An account with ADMIN_EMAIL already exists.");
  }

  const userId = randomUUID();
  const passwordHash = await hashPassword(credentials.password);

  await db.transaction(async (transaction) => {
    await transaction.insert(user).values({
      id: userId,
      name: credentials.name,
      email: credentials.email,
      emailVerified: true,
    });
    await transaction.insert(account).values({
      id: randomUUID(),
      accountId: userId,
      providerId: "credential",
      userId,
      password: passwordHash,
    });
  });
}

async function main() {
  try {
    await createAdmin();
    console.log("Administrator account created.");
  } finally {
    await client.end({ timeout: 5 });
  }
}

void main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "Administrator creation failed.",
  );
  process.exitCode = 1;
});
