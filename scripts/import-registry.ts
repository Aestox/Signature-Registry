import "dotenv/config";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { z } from "zod";
import { client, db } from "../src/lib/db/client";
import { registryRecords } from "../src/lib/db/schema";
import { sql } from "drizzle-orm";

const sourceText = z.preprocess(
  (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === "string" || typeof value === "number") {
      return String(value).trim() || null;
    }
    return value;
  },
  z.string().nullable(),
);

const sourceDate = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  z.iso.date().nullable(),
);

const sourceBoolean = z
  .union([z.boolean(), z.literal(0), z.literal(1), z.literal("0"), z.literal("1")])
  .transform((value) => value === true || value === 1 || value === "1");

const sourceRecordSchema = z.object({
  id: z.coerce.number().int().positive(),
  nameFull: z.string().trim().min(1),
  email: sourceText,
  post: sourceText,
  depo: sourceText,
  certificate_type: sourceText,
  serial_number: sourceText,
  certificate_status: sourceText,
  release_date: sourceDate,
  end_date: sourceDate,
  certification_center: sourceText,
  platform: sourceText,
  mchd: sourceText,
  release_date_mchd: sourceDate,
  end_date_mchd: sourceDate,
  contract: sourceText,
  place_contur_extern: sourceBoolean,
  fired: sourceBoolean,
  notes: sourceText,
});

function mapSourceRecord(record: z.infer<typeof sourceRecordSchema>) {
  return {
    id: record.id,
    fullName: record.nameFull,
    email: record.email,
    position: record.post,
    depot: record.depo,
    certificateType: record.certificate_type,
    serialNumber: record.serial_number,
    certificateStatus: record.certificate_status,
    issueDate: record.release_date,
    expiryDate: record.end_date,
    certificationCenter: record.certification_center,
    platform: record.platform,
    mchd: record.mchd,
    mchdIssueDate: record.release_date_mchd,
    mchdExpiryDate: record.end_date_mchd,
    contract: record.contract,
    placeConturExtern: record.place_contur_extern,
    isFired: record.fired,
    notes: record.notes,
  };
}

async function importRegistry() {
  const filePath = process.argv[2];
  if (!filePath) {
    throw new Error("Usage: npm run db:import -- <path-to-registry.json>");
  }

  let source: unknown;
  try {
    source = JSON.parse(await readFile(resolve(filePath), "utf8"));
  } catch {
    throw new Error("Cannot read the import file. Check its path and JSON format.");
  }

  const parsed = z.array(sourceRecordSchema).safeParse(source);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const rowNumber = typeof issue.path[0] === "number" ? issue.path[0] + 1 : 1;
    const field = issue.path
      .slice(typeof issue.path[0] === "number" ? 1 : 0)
      .join(".");
    throw new Error(
      `Invalid export at row ${rowNumber}${field ? `, field "${field}"` : ""}.`,
    );
  }

  const ids = new Set<number>();
  for (const [index, record] of parsed.data.entries()) {
    if (ids.has(record.id)) {
      throw new Error(`Duplicate record ID at row ${index + 1}.`);
    }
    ids.add(record.id);
  }

  if (parsed.data.length === 0) {
    console.log("The export contains no registry records.");
    return;
  }

  const records = parsed.data.map(mapSourceRecord);
  await db.transaction(async (transaction) => {
    for (let offset = 0; offset < records.length; offset += 500) {
      await transaction
        .insert(registryRecords)
        .values(records.slice(offset, offset + 500));
    }

    await transaction.execute(sql`
      SELECT setval(
        pg_get_serial_sequence('registry_records', 'id'),
        COALESCE(MAX(id), 1),
        MAX(id) IS NOT NULL
      )
      FROM registry_records
    `);
  });

  console.log(`Imported ${records.length} registry records.`);
}

async function main() {
  try {
    await importRegistry();
  } finally {
    await client.end({ timeout: 5 });
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Import failed.");
  process.exitCode = 1;
});
