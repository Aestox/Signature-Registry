import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { registryRecords } from "@/lib/db/schema";

export async function getPublicRegistryRecords() {
  return db
    .select({
      id: registryRecords.id,
      fullName: registryRecords.fullName,
      position: registryRecords.position,
      depot: registryRecords.depot,
      expiryDate: registryRecords.expiryDate,
      mchdExpiryDate: registryRecords.mchdExpiryDate,
    })
    .from(registryRecords)
    .where(eq(registryRecords.isFired, false))
    .orderBy(asc(registryRecords.fullName));
}
