import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  Calendar,
  Camera,
  Check,
  ChevronDown,
  Compass,
  HeartPulse,
  Lock,
  Moon,
  ScanFace,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Sunrise,
  UserCog,
  Wand,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { AppRoute } from '@/constants/app-routes';
import { marketingNav } from '@/lib/marketing-pages';

const SECTION_ICONS: Record<string, LucideIcon> = {
  shelf: Boxes,
  routine: Calendar,
  checks: ScanSearch,
  journal: Camera,
  profile: ScanFace,
  sensitive: HeartPulse,
  privacy: Lock,
  morning: Sunrise,
  evening: Moon,
  recovery: HeartPulse,
  history: Calendar,
  guardrails: ShieldCheck,
  clarity: Wand,
  profileCog: UserCog,
};

export interface MarketingPageSection {
  title: string;
  body: string;
  /** Key into the section icon registry. Falls back to a sparkle. */
  icon?: string;
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
  whyHeading: string;
  /** Optional kicker above the "why it matters" heading. */
  whyKicker?: string;
  /** Render the sections as a numbered sequence (used for step-by-step pages). */
  numberedSections?: boolean;
  sections: MarketingPageSection[];
  faqs: MarketingPageFaq[];
  closingTitle?: string;
  closingBody?: string;
  /** Canonical path of the current page, used to exclude it from cross-links. */
  path?: AppRoute;
  children?: ReactNode;
}

export function MarketingPage({
  eyebrow,
  title,
  description,
  benefits,
  whyHeading,
  whyKicker = 'Why it matters',
  numberedSections = false,
  sections,
  faqs,
  closingTitle = 'Start with the shelf you already have.',
  closingBody = 'Create a free Ritora account and turn the products you already own into a routine you can repeat.',
  path,
  children,
}: MarketingPageProps) {
  const relatedPages = marketingNav.filter((item) => item.path !== path);

  // Avoid a self-referencing secondary CTA on the How it works page.
  const secondaryCta =
    path === AppRoute.HowItWorks
      ? { href: AppRoute.Features, label: 'Browse features' }
      : { href: AppRoute.HowItWorks, label: 'See how it works' };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <SiteHeader />
      <main>
        {/* ---------------------------------------------------------------- */}
        {/* Hero                                                             */}
        {/* ---------------------------------------------------------------- */}
        <section className="relative overflow-hidden border-b border-border bg-[linear-gradient(180deg,var(--surface)_0%,var(--background)_100%)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-70"
            style={{
              background:
                'linear-gradient(90deg, transparent, var(--accent-glow), var(--secondary-glow), transparent)',
            }}
          />
          <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-5 py-16 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.78fr)] lg:items-center lg:gap-16 lg:px-8 lg:py-24">
            <div className="animate-fade-up">
              <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent-strong shadow-soft">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                {eyebrow}
              </p>
              <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground text-balance sm:text-5xl lg:text-[58px]">
                {title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
                {description}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href={AppRoute.Register}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold text-background shadow-soft transition hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-base"
                >
                  Create free account
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href={secondaryCta.href}
                  className="inline-flex items-center justify-center rounded-full border border-border-strong bg-surface px-7 py-3.5 text-sm font-semibold text-foreground transition hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-base"
                >
                  {secondaryCta.label}
                </Link>
              </div>
            </div>

            <aside className="animate-fade-up-delay-1 self-start rounded-lg border border-border bg-surface p-6 shadow-hero sm:p-7">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <BadgeCheck className="h-4 w-4 text-accent-strong" aria-hidden="true" />
                What you get
              </p>
              <ul className="mt-5 space-y-3">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-medium leading-6 text-foreground">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-t border-border pt-4 text-xs leading-5 text-muted">
                Free to start. Brand-neutral. Built around the products you
                already own.
              </p>
            </aside>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Why it matters + feature cards                                   */}
        {/* ---------------------------------------------------------------- */}
        <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">
                {whyKicker}
              </p>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-[38px]">
                {whyHeading}
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-muted">
                Ritora keeps your products, profile, and skin history in one
                place, so each routine decision has real context behind it.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {sections.map((section, index) => {
                const Icon = SECTION_ICONS[section.icon ?? ''] ?? Sparkles;
                return (
                  <article
                    key={section.title}
                    className="group rounded-lg border border-border bg-surface p-6 shadow-soft transition hover:-translate-y-1 hover:border-accent"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-accent-soft text-accent-strong transition group-hover:scale-105">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      {numberedSections ? (
                        <span className="font-display text-sm font-bold tracking-wide text-muted">
                          Step {index + 1}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-foreground">
                      {section.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-7 text-muted">
                      {section.body}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {children}

        {/* ---------------------------------------------------------------- */}
        {/* FAQ (native accordion)                                           */}
        {/* ---------------------------------------------------------------- */}
        <section className="border-t border-border bg-surface/60">
          <div className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">
              FAQ
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-[38px]">
              Questions people ask before using Ritora
            </h2>
            <div className="mt-8 space-y-3">
              {faqs.map((faq, index) => (
                <details
                  key={faq.question}
                  className="group rounded-lg border border-border bg-surface px-5 shadow-soft transition open:border-accent"
                  open={index === 0}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-base font-semibold text-foreground marker:hidden [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <ChevronDown
                      className="h-5 w-5 shrink-0 text-muted transition group-open:rotate-180 group-open:text-accent-strong"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="pb-5 text-sm leading-7 text-muted">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Explore more (internal cross-links)                              */}
        {/* ---------------------------------------------------------------- */}
        {relatedPages.length > 0 ? (
          <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="flex items-center gap-2.5">
              <Compass className="h-5 w-5 text-accent-strong" aria-hidden="true" />
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Explore more of Ritora
              </h2>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPages.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className="group flex flex-col rounded-lg border border-border bg-surface p-6 shadow-soft transition hover:-translate-y-1 hover:border-accent"
                >
                  <p className="text-base font-semibold text-foreground">
                    {item.label}
                  </p>
                  <p className="mt-2 flex-1 text-sm leading-7 text-muted">
                    {item.blurb}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-strong">
                    Learn more
                    <ArrowRight
                      className="h-4 w-4 transition group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* ---------------------------------------------------------------- */}
        {/* Closing CTA                                                      */}
        {/* ---------------------------------------------------------------- */}
        <section className="border-t border-border bg-surface/60">
          <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="relative overflow-hidden rounded-lg border border-border bg-surface px-6 py-12 text-center shadow-hero sm:px-12 sm:py-16">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-75"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, var(--accent-glow), transparent)',
                }}
              />
              <div className="relative">
                <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
                  {closingTitle}
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted">
                  {closingBody}
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link
                    href={AppRoute.Register}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold text-background shadow-soft transition hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-base"
                  >
                    Create free account
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link
                    href={AppRoute.Login}
                    className="inline-flex items-center justify-center rounded-full border border-border-strong bg-surface px-7 py-3.5 text-sm font-semibold text-foreground transition hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-base"
                  >
                    Log in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </div>
  );
}
