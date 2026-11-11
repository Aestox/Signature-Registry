"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { saveRegistryRecord } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { registryRecords } from "@/lib/db/schema";

type RegistryRecord = typeof registryRecords.$inferSelect;

const initialState = { message: "", success: false };

export function RegistryEditor({ record }: { record?: RegistryRecord }) {
  const locale = useLocale() === "en" ? "en" : "ru";
  const t = useTranslations("Editor");
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(initialState);
  const [isPending, startTransition] = useTransition();
  const [formKey, setFormKey] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setState(initialState);
      setFormKey((key) => key + 1);
    } else {
      formRef.current?.reset();
    }
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await saveRegistryRecord(initialState, formData);
      setState(result);
      if (result.success) {
        setOpen(false);
        formRef.current?.reset();
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {record ? (
          <Button variant="outline" size="lg">
            {t("edit")}
          </Button>
        ) : (
          <Button size="lg">
            <Plus aria-hidden="true" />
            {t("add")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {record ? t("editTitle") : t("newTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <form
          key={formKey}
          ref={formRef}
          action={handleSubmit}
          className="space-y-5"
        >
          <input type="hidden" name="id" value={record?.id ?? ""} />
          <input type="hidden" name="locale" value={locale} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("fullName")} name="fullName" required value={record?.fullName} />
            <Field label={t("email")} name="email" type="email" value={record?.email} />
            <Field label={t("position")} name="position" value={record?.position} />
            <Field label={t("department")} name="depot" value={record?.depot} />
            <Field
              label={t("certificateType")}
              name="certificateType"
              value={record?.certificateType}
            />
            <Field
              label={t("serialNumber")}
              name="serialNumber"
              value={record?.serialNumber}
            />
            <Field
              label={t("certificateStatus")}
              name="certificateStatus"
              value={record?.certificateStatus}
            />
            <Field
              label={t("certificationCenter")}
              name="certificationCenter"
              value={record?.certificationCenter}
            />
            <DateField label={t("certificateIssueDate")} name="issueDate" value={record?.issueDate} />
            <DateField label={t("certificateExpiryDate")} name="expiryDate" value={record?.expiryDate} />
            <Field label={t("platform")} name="platform" value={record?.platform} />
            <Field label={t("mchd")} name="mchd" value={record?.mchd} />
            <DateField
              label={t("mchdIssueDate")}
              name="mchdIssueDate"
              value={record?.mchdIssueDate}
            />
            <DateField
              label={t("mchdExpiryDate")}
              name="mchdExpiryDate"
              value={record?.mchdExpiryDate}
            />
            <Field label={t("contract")} name="contract" value={record?.contract} />
            <CheckboxField
              label={t("conturPlace")}
              name="placeConturExtern"
              checked={record?.placeConturExtern}
            />
            <CheckboxField
              label={t("fired")}
              name="isFired"
              checked={record?.isFired}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">{t("notes")}</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={record?.notes ?? ""}
              rows={3}
            />
          </div>
          <CustomFieldsEditor fields={record?.customFields ?? {}} />
          {state.message && (
            <p
              role={state.success ? "status" : "alert"}
              className={
                state.success
                  ? "text-sm text-emerald-700"
                  : "text-sm text-rose-700"
              }
            >
              {state.message}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => handleOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" size="lg" disabled={isPending}>
              <Save aria-hidden="true" />
              {isPending ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  name,
  type = "text",
  value,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  value?: string | null;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={value ?? ""}
        required={required}
      />
    </div>
  );
}

function DateField({
  label,
  name,
  value,
}: {
  label: string;
  name: string;
  value?: string | null;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type="date" defaultValue={value ?? ""} />
    </div>
  );
}

function CheckboxField({
  label,
  name,
  checked = false,
}: {
  label: string;
  name: string;
  checked?: boolean;
}) {
  return (
    <label className="flex min-h-9 items-center gap-2 self-end text-sm">
      <input
        name={name}
        type="checkbox"
        defaultChecked={checked}
        className="size-4 accent-primary"
      />
      {label}
    </label>
  );
}

function CustomFieldsEditor({
  fields,
}: {
  fields: RegistryRecord["customFields"];
}) {
  const t = useTranslations("Editor");
  const [items, setItems] = useState(() =>
    Object.entries(fields).map(([name, value]) => ({
      name,
      value: value === null ? "" : String(value),
    })),
  );
  const names = items.map((item) => item.name.trim()).filter(Boolean);
  const hasDuplicateNames = new Set(names).size !== names.length;
  const serializedFields = JSON.stringify(
    items
      .filter((item) => item.name.trim())
      .map((item) => ({ name: item.name.trim(), value: item.value })),
  );

  return (
    <section className="space-y-3">
      <input type="hidden" name="customFields" value={serializedFields} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Label>{t("additionalFields")}</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("adminOnlyFields")}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => setItems((current) => [...current, { name: "", value: "" }])}
        >
          <Plus aria-hidden="true" />
          {t("addField")}
        </Button>
      </div>
      {items.map((item, index) => (
        <div key={index} className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
          <Input
            value={item.name}
            maxLength={100}
            aria-label={t("fieldNameAria", { number: index + 1 })}
            placeholder={t("fieldName")}
            onChange={(event) =>
              setItems((current) =>
                current.map((field, fieldIndex) =>
                  fieldIndex === index
                    ? { ...field, name: event.target.value }
                    : field,
                ),
              )
            }
          />
          <Input
            value={item.value}
            maxLength={4000}
            aria-label={t("fieldValueAria", { number: index + 1 })}
            placeholder={t("fieldValue")}
            onChange={(event) =>
              setItems((current) =>
                current.map((field, fieldIndex) =>
                  fieldIndex === index
                    ? { ...field, value: event.target.value }
                    : field,
                ),
              )
            }
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-label={t("removeFieldAria", { number: index + 1 })}
            onClick={() =>
              setItems((current) =>
                current.filter((_, fieldIndex) => fieldIndex !== index),
              )
            }
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      ))}
      {hasDuplicateNames && (
        <p role="alert" className="text-sm text-rose-700">
          {t("duplicateFields")}
        </p>
      )}
    </section>
  );
}
