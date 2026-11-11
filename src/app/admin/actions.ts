"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { registryRecords } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { routing, type Locale } from "@/i18n/routing";

const localeSchema = z.enum(routing.locales);

const optionalText = z
  .string()
  .trim()
  .max(4000)
  .transform((value) => value || null);

const optionalDate = z
  .union([z.literal(""), z.iso.date()])
  .transform((value) => value || null);

const customFields = z.string().transform((value, context) => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    context.addIssue({ code: "custom", message: "Invalid custom fields." });
    return z.NEVER;
  }

  const result = z
    .array(
      z.object({
        name: z.string().trim().min(1).max(100),
        value: z.string().max(4000),
      }),
    )
    .safeParse(parsed);

  if (!result.success) {
    context.addIssue({ code: "custom", message: "Invalid custom fields." });
    return z.NEVER;
  }

  const fields: Record<string, string> = {};
  for (const field of result.data) {
    if (Object.hasOwn(fields, field.name)) {
      context.addIssue({ code: "custom", message: "Duplicate custom field." });
      return z.NEVER;
    }
    fields[field.name] = field.value;
  }
  return fields;
});

const recordSchema = z.object({
  id: z.union([z.literal(""), z.string().regex(/^[1-9]\d*$/)]),
  fullName: z.string().trim().min(1).max(255),
  email: z.union([z.literal(""), z.email()]).transform((value) => value || null),
  position: optionalText,
  depot: optionalText,
  certificateType: optionalText,
  serialNumber: optionalText,
  certificateStatus: optionalText,
  issueDate: optionalDate,
  expiryDate: optionalDate,
  certificationCenter: optionalText,
  platform: optionalText,
  mchd: optionalText,
  mchdIssueDate: optionalDate,
  mchdExpiryDate: optionalDate,
  contract: optionalText,
  placeConturExtern: z.boolean(),
  isFired: z.boolean(),
  notes: optionalText,
  customFields,
});

export type RegistryActionState = {
  message: string;
  success: boolean;
};

export async function saveRegistryRecord(
  _previousState: RegistryActionState,
  formData: FormData,
): Promise<RegistryActionState> {
  const locale = localeSchema.parse(String(formData.get("locale") ?? ""));
  await requireAdmin(locale);
  const t = await getTranslations({ locale, namespace: "Actions" });

  const parsed = recordSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    position: String(formData.get("position") ?? ""),
    depot: String(formData.get("depot") ?? ""),
    certificateType: String(formData.get("certificateType") ?? ""),
    serialNumber: String(formData.get("serialNumber") ?? ""),
    certificateStatus: String(formData.get("certificateStatus") ?? ""),
    issueDate: String(formData.get("issueDate") ?? ""),
    expiryDate: String(formData.get("expiryDate") ?? ""),
    certificationCenter: String(formData.get("certificationCenter") ?? ""),
    platform: String(formData.get("platform") ?? ""),
    mchd: String(formData.get("mchd") ?? ""),
    mchdIssueDate: String(formData.get("mchdIssueDate") ?? ""),
    mchdExpiryDate: String(formData.get("mchdExpiryDate") ?? ""),
    contract: String(formData.get("contract") ?? ""),
    placeConturExtern: formData.get("placeConturExtern") === "on",
    isFired: formData.get("isFired") === "on",
    notes: String(formData.get("notes") ?? ""),
    customFields: String(formData.get("customFields") ?? "[]"),
  });

  if (!parsed.success) {
    return {
      message: t("validationError"),
      success: false,
    };
  }

  const { id, ...values } = parsed.data;
  if (id) {
    const [updated] = await db
      .update(registryRecords)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(registryRecords.id, Number(id)))
      .returning({ id: registryRecords.id });

    if (!updated) {
      return { message: t("notFound"), success: false };
    }
  } else {
    await db.insert(registryRecords).values(values);
  }

  revalidatePath(`/${locale}`);
  revalidatePath(`/${locale}/admin`);
  return {
    message: id ? t("saved") : t("added"),
    success: true,
  };
}

export async function deleteRegistryRecord(id: number, locale: Locale) {
  await requireAdmin(locale);

  const parsedId = z.number().int().positive().safeParse(id);
  if (!parsedId.success) {
    throw new Error("Invalid registry record ID.");
  }

  const [deleted] = await db
    .delete(registryRecords)
    .where(eq(registryRecords.id, parsedId.data))
    .returning({ id: registryRecords.id });

  if (!deleted) {
    throw new Error("Registry record was not found.");
  }

  revalidatePath(`/${locale}`);
  revalidatePath(`/${locale}/admin`);
}
