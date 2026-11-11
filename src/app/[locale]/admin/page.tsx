import { Suspense } from "react";
import { ArrowLeft, FileKey2, UsersRound } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { connection } from "next/server";
import { AdminRegistryTable } from "@/components/admin-registry-table";
import { AdminSignOut } from "@/components/admin-sign-out";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdmin } from "@/lib/admin-session";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { db } from "@/lib/db";
import { registryRecords } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return (
    <Suspense fallback={<AdminLoading />}>
      <AdminDashboard locale={locale} />
    </Suspense>
  );
}

async function AdminDashboard({ locale }: { locale: Locale }) {
  await connection();
  const [session, t] = await Promise.all([
    requireAdmin(locale),
    getTranslations("AdminPage"),
  ]);
  const records = await db
    .select()
    .from(registryRecords)
    .orderBy(asc(registryRecords.fullName));
  const activeRecords = records.filter((record) => !record.isFired);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1440px] px-4 py-7 sm:px-8 lg:px-12">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
        <div>
          <Link
            href="/"
            className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            {t("guestMode")}
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("signedInAs", { email: session.user.email })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <AdminSignOut />
        </div>
      </header>

      <section className="grid gap-4 py-6 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">{t("activeRecords")}</p>
              <p className="mt-2 text-3xl font-semibold">{activeRecords.length}</p>
            </div>
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/5 text-primary">
              <UsersRound className="size-5" aria-hidden="true" />
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">{t("allRecordsCount")}</p>
              <p className="mt-2 text-3xl font-semibold">{records.length}</p>
            </div>
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/5 text-primary">
              <FileKey2 className="size-5" aria-hidden="true" />
            </span>
          </CardContent>
        </Card>
      </section>

      <AdminRegistryTable records={records} />
    </main>
  );
}

function AdminLoading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1440px] px-4 py-7 sm:px-8 lg:px-12">
      <div className="h-20 animate-pulse border-b bg-white" />
      <div className="grid gap-4 py-6 sm:grid-cols-2">
        <div className="h-28 animate-pulse rounded-xl border bg-white" />
        <div className="h-28 animate-pulse rounded-xl border bg-white" />
      </div>
      <div className="h-80 animate-pulse rounded-xl border bg-white" />
    </main>
  );
}
