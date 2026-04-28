import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legalPages.cookies");

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

export default async function CookiesPage() {
  const t = await getTranslations("legalPages.cookies");
  const paragraphs = t.raw("paragraphs") as string[];

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-16 sm:px-6 lg:px-8">
      <div className="rounded-4xl border border-border bg-surface/92 p-8 shadow-soft sm:p-10">
        <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <div className="mt-8 space-y-6 text-base leading-8 text-muted">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </main>
  );
}
