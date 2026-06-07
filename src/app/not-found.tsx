import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { RitoraMark } from "@/components/icons/ritora-mark";
import { Button } from "@/components/ui/button";
import { AppRoute } from "@/constants/app-routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("notFound");

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
    robots: { index: false, follow: false },
  };
}

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-6 py-16">
      {/* Soft brand glow, kept faint so the content stays calm. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-glow blur-[120px]"
      />

      <section className="relative flex w-full max-w-md flex-col items-center text-center">
        <span className="relative grid place-items-center">
          <span
            aria-hidden="true"
            className="absolute h-24 w-24 rounded-full bg-accent-soft"
          />
          <span
            aria-hidden="true"
            className="absolute h-16 w-16 rounded-full bg-surface shadow-soft"
          />
          <RitoraMark className="relative h-9 w-9 text-accent-strong" />
        </span>

        <h1 className="font-display mt-9 text-balance text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-[2.5rem]">
          {t("title")}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          {t("body")}
        </p>

        <Button asChild size="lg" className="mt-9">
          <Link href={AppRoute.Home}>{t("backHome")}</Link>
        </Button>
      </section>
    </main>
  );
}
