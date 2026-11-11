import { Suspense } from "react";
import { FileKey2, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { connection } from "next/server";
import { headers } from "next/headers";
import { RegistryBrowser } from "@/components/registry-browser";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { auth } from "@/lib/auth";
import { Link } from "@/i18n/navigation";
import { getPublicRegistryRecords } from "@/lib/registry";

export function generateMetadata(): Metadata {
  return {
    alternates: {
      languages: {
        en: "/en",
        ru: "/ru",
      },
    },
  };
}

export default async function Home() {
  const brand = await getTranslations("Brand");
  const navigation = await getTranslations("PublicPage");
  const accessLabels = {
    adminReturn: navigation("adminReturn"),
    adminLogin: navigation("adminLogin"),
    adminShort: navigation("adminShort"),
    loginShort: navigation("loginShort"),
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <header className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 py-5 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-3" aria-label={brand("homeLabel")}>
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#122a43] text-white shadow-sm">
            <FileKey2 className="size-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-semibold leading-5">
              {brand("name")}
            </span>
            <span className="block text-xs text-muted-foreground">
              {brand("tagline")}
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <Suspense
            fallback={
              <AdminAccessLink authenticated={false} labels={accessLabels} />
            }
          >
            <AdminNavigation labels={accessLabels} />
          </Suspense>
        </div>
      </header>
      <Suspense fallback={<RegistryLoading />}>
        <PublicRegistry />
      </Suspense>
    </div>
  );
}

async function AdminNavigation({
  labels,
}: {
  labels: AdminAccessLabels;
}) {
  await connection();
  const session = await auth.api.getSession({ headers: await headers() });
  return <AdminAccessLink authenticated={Boolean(session)} labels={labels} />;
}

type AdminAccessLabels = {
  adminReturn: string;
  adminLogin: string;
  adminShort: string;
  loginShort: string;
};

function AdminAccessLink({
  authenticated,
  labels,
}: {
  authenticated: boolean;
  labels: AdminAccessLabels;
}) {
  return (
    <Link
      href={authenticated ? "/admin" : "/admin/login"}
      className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-medium text-foreground transition hover:bg-muted"
    >
      <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
      <span className="hidden sm:inline">
        {authenticated ? labels.adminReturn : labels.adminLogin}
      </span>
      <span className="sm:hidden">
        {authenticated ? labels.adminShort : labels.loginShort}
      </span>
    </Link>
  );
}

async function PublicRegistry() {
  await connection();
  const session = await auth.api.getSession({ headers: await headers() });
  const records = await getPublicRegistryRecords();
  return (
    <RegistryBrowser records={records} isAdmin={Boolean(session)} />
  );
}

function RegistryLoading() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-16 sm:px-8 lg:px-12">
      <div className="h-64 animate-pulse rounded-3xl bg-[#122a43]/10" />
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-28 animate-pulse rounded-xl border bg-white"
          />
        ))}
      </div>
      <div className="mt-7 h-72 animate-pulse rounded-xl border bg-white" />
    </div>
  );
}
