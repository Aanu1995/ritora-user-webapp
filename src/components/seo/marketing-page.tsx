import Link from 'next/link';
import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { AppRoute } from '@/constants/app-routes';

export interface MarketingPageSection {
  title: string;
  body: string;
}

export interface MarketingPageFaq {
  question: string;
  answer: string;
}

export interface MarketingPageProps {
  eyebrow: string;
  title: string;
  description: string;
  primaryKeyword: string;
  benefits: string[];
  sections: MarketingPageSection[];
  faqs: MarketingPageFaq[];
  children?: ReactNode;
}

export function MarketingPage({
  eyebrow,
  title,
  description,
  primaryKeyword,
  benefits,
  sections,
  faqs,
  children,
}: MarketingPageProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-surface/50">
          <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.7fr)] lg:px-8 lg:py-24">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-strong">
                {eyebrow}
              </p>
              <h1 className="mt-5 max-w-4xl font-display text-[40px] font-bold leading-[1.05] tracking-tight text-foreground sm:text-[56px] lg:text-[64px]">
                {title}
              </h1>
              <p className="mt-6 max-w-2xl text-[17px] leading-8 text-muted sm:text-lg">
                {description}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={AppRoute.Register}
                  className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:-translate-y-0.5 hover:opacity-95"
                >
                  Create account
                </Link>
                <Link
                  href={AppRoute.Home}
                  className="inline-flex items-center justify-center rounded-full border border-border-strong bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:border-accent"
                >
                  Back to home
                </Link>
              </div>
            </div>

            <aside className="self-start border border-border bg-background p-6 shadow-sm">
              <p className="text-sm font-semibold text-foreground">
                Best for people searching:
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">{primaryKeyword}</p>
              <div className="mt-6 space-y-3">
                {benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="border-l-2 border-accent bg-accent-soft/40 px-4 py-3 text-sm font-medium leading-6 text-foreground"
                  >
                    {benefit}
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                Why it matters
              </p>
              <h2 className="mt-4 font-display text-[30px] font-bold leading-tight tracking-tight text-foreground sm:text-[38px]">
                Skincare decisions should come from your real routine, not guesswork.
              </h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {sections.map((section) => (
                <article key={section.title} className="border border-border bg-surface/70 p-5">
                  <h3 className="text-base font-semibold text-foreground">
                    {section.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{section.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {children}

        <section className="border-t border-border bg-surface/60">
          <div className="mx-auto w-full max-w-4xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
            <h2 className="font-display text-[30px] font-bold tracking-tight text-foreground sm:text-[38px]">
              Questions people ask before using Ritora
            </h2>
            <div className="mt-8 divide-y divide-border border-y border-border">
              {faqs.map((faq) => (
                <article key={faq.question} className="py-6">
                  <h3 className="text-base font-semibold text-foreground">
                    {faq.question}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
