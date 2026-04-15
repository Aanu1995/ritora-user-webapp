import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms foundations for the Ritora web experience.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-16 sm:px-6 lg:px-8">
      <div className="rounded-4xl border border-border bg-surface/92 p-8 shadow-soft sm:p-10">
        <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
          Terms of Service
        </p>
        <h1 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">
          Terms foundations for Ritora
        </h1>
        <div className="mt-8 space-y-6 text-base leading-8 text-muted">
          <p>
            Ritora is intended as a skincare decision-support experience, not a
            diagnostic or medical tool. The platform direction focuses on safer
            routine decisions, inventory clarity, and calmer product use.
          </p>
          <p>
            As the product matures, these terms will be expanded to cover
            account responsibilities, acceptable use, disclaimer language, and
            service boundaries in production detail.
          </p>
          <p>
            The current page exists so the public experience already has a real
            legal route structure instead of placeholder links.
          </p>
        </div>
      </div>
    </main>
  );
}
