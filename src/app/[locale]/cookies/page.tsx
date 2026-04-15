import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Notice',
  description: 'Cookie notice foundations for the Ritora web experience.',
};

export default function CookiesPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-16 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/92 p-8 shadow-[var(--shadow-soft)] sm:p-10">
        <p className="text-sm font-semibold tracking-[0.2em] text-[color:var(--color-accent)] uppercase">
          Cookie Notice
        </p>
        <h1 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">
          Cookie foundations for Ritora
        </h1>
        <div className="mt-8 space-y-6 text-base leading-8 text-[color:var(--color-muted)]">
          <p>
            The product direction aims to keep cookie use minimal and
            transparent. Authentication cookies and carefully scoped preference
            cookies are preferred over unnecessary tracking.
          </p>
          <p>
            A fuller cookie notice will document what is essential, what is
            optional, and how user consent affects analytics or preference
            storage as more features ship.
          </p>
        </div>
      </div>
    </main>
  );
}
