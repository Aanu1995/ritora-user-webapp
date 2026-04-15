import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy foundations for the Ritora web experience.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-16 sm:px-6 lg:px-8">
      <div className="rounded-4xl border border-border bg-surface/92 p-8 shadow-soft sm:p-10">
        <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
          Privacy Policy
        </p>
        <h1 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">
          Privacy foundations for Ritora
        </h1>
        <div className="mt-8 space-y-6 text-base leading-8 text-muted">
          <p>
            Ritora is being built with privacy-by-design principles from the
            start. The product direction prioritizes data minimization, clear
            consent, and a boundary between public education features and
            private personalized routines.
          </p>
          <p>
            As implementation expands, this page will be replaced with a full
            policy that documents lawful basis, retention periods, processor
            relationships, and export and deletion rights in more detail.
          </p>
          <p>
            For now, this page establishes the intent behind the current
            technical improvements: secure auth foundations, explicit consent
            versioning, and a privacy-aware backend baseline.
          </p>
        </div>
      </div>
    </main>
  );
}
