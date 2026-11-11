import { FileKey2, LockKeyhole } from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const brand = await getTranslations({ locale, namespace: "Brand" });
  const t = await getTranslations({ locale, namespace: "LoginPage" });

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#122a43] text-white shadow-sm">
              <FileKey2 className="size-5" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold">{brand("name")}</span>
          </Link>
          <LocaleSwitcher />
        </div>
        <section className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex size-11 items-center justify-center rounded-xl bg-primary/5 text-primary">
            <LockKeyhole className="size-5" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {t("description")}
          </p>
          <LoginForm />
          <p className="mt-6 border-t pt-5 text-center text-xs text-muted-foreground">
            {t("ownerNotice")}
          </p>
        </section>
        <p className="mt-5 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground hover:underline">
            {t("returnPublic")}
          </Link>
        </p>
      </div>
    </main>
  );
}
