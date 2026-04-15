import type { Metadata } from 'next';
import {
  Globe,
  Lock,
  type LucideIcon,
  Package,
  ShieldCheck,
  Sunrise,
  User,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { HeroShelfIllustration } from '@/components/illustrations/hero-shelf';
import { IngredientCheckIllustration } from '@/components/illustrations/ingredient-check';
import { RoutineCycleIllustration } from '@/components/illustrations/routine-cycle';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { Link } from '@/i18n/navigation';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  alternates: {
    canonical: '/',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: siteConfig.name,
  applicationCategory: 'HealthApplication',
  operatingSystem: 'Web',
  description: siteConfig.description,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
};

const featureIconMap: Record<string, LucideIcon> = {
  package: Package,
  'shield-check': ShieldCheck,
  user: User,
  lock: Lock,
  globe: Globe,
  sunrise: Sunrise,
};

interface ProblemItem {
  title: string;
  body: string;
}

interface StepItem {
  title: string;
  body: string;
}

interface FeatureItem {
  title: string;
  body: string;
  icon: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface TrustItem {
  value: string;
  label: string;
}

export default async function Home() {
  const t = await getTranslations('landing');

  const problems = t.raw('problems') as ProblemItem[];
  const steps = t.raw('steps') as StepItem[];
  const features = t.raw('featureItems') as FeatureItem[];
  const faqs = t.raw('faqItems') as FaqItem[];
  const trustItems = t.raw('trust.items') as TrustItem[];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <SiteHeader />
      <main>
        {/* HERO */}
        <section className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pt-10 pb-20 sm:px-6 sm:pt-16 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:px-8 lg:pt-24 lg:pb-28">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-2 text-sm font-medium text-[color:var(--color-muted)] shadow-[var(--shadow-soft)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--color-accent)] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--color-accent)]" />
              </span>
              {t('hero.badge')}
            </div>

            <div className="space-y-6">
              <h1 className="max-w-3xl text-balance text-4xl leading-[1.08] font-semibold tracking-tight text-[color:var(--color-foreground)] sm:text-5xl sm:leading-[1.06] lg:text-6xl lg:leading-[1.05]">
                {t('hero.headline')}
              </h1>
              <p className="max-w-xl text-lg leading-8 text-[color:var(--color-muted)] sm:text-xl">
                {t('hero.subheadline')}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-foreground)] px-7 py-3.5 text-base font-semibold text-[color:var(--color-background)] shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-background)]"
              >
                {t('hero.ctaPrimary')}
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-7 py-3.5 text-base font-semibold text-[color:var(--color-foreground)] transition hover:border-[color:var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-background)]"
              >
                {t('hero.ctaSecondary')}
              </Link>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {(['a', 'b', 'c'] as const).map((key) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-2 text-sm font-medium text-[color:var(--color-muted)]"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)]" />
                  {t(`hero.pills.${key}`)}
                </span>
              ))}
            </div>
          </div>

          {/* Hero illustration */}
          <div className="relative">
            <div className="absolute -inset-8 rounded-[3rem] bg-[color:var(--color-accent-glow)] blur-3xl" aria-hidden="true" />
            <div className="relative">
              <HeroShelfIllustration className="h-auto w-full" />
            </div>
          </div>
        </section>

        {/* TRUST STRIP */}
        <section className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <p className="text-xs font-semibold tracking-[0.22em] text-[color:var(--color-accent-strong)] uppercase">
              {t('trust.eyebrow')}
            </p>
            <dl className="mt-4 grid gap-6 sm:grid-cols-3">
              {trustItems.map((item) => (
                <div key={item.label} className="flex items-baseline gap-3">
                  <dt className="text-4xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
                    {item.value}
                  </dt>
                  <dd className="text-sm leading-6 text-[color:var(--color-muted)]">
                    {item.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* PROBLEM */}
        <section
          id="problem"
          className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28"
        >
          <div className="max-w-3xl space-y-5">
            <p className="text-xs font-semibold tracking-[0.22em] text-[color:var(--color-accent-strong)] uppercase">
              {t('problem.eyebrow')}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-[color:var(--color-foreground)] sm:text-4xl lg:text-5xl lg:leading-[1.1]">
              {t('problem.headline')}
            </h2>
            <p className="text-lg leading-8 text-[color:var(--color-muted)]">
              {t('problem.body')}
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {problems.map((problem, index) => (
              <article
                key={problem.title}
                className="group relative overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-7 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-[color:var(--color-accent)]"
              >
                <span
                  aria-hidden="true"
                  className="text-5xl font-semibold tracking-tight text-[color:var(--color-accent)]"
                >
                  0{index + 1}
                </span>
                <h3 className="mt-4 text-xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
                  {problem.title}
                </h3>
                <p className="mt-3 text-base leading-7 text-[color:var(--color-muted)]">
                  {problem.body}
                </p>
                <span
                  aria-hidden="true"
                  className="absolute right-0 bottom-0 h-16 w-16 translate-x-6 translate-y-6 rounded-full bg-[color:var(--color-accent-glow)] transition group-hover:scale-110"
                />
              </article>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28"
        >
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="absolute -inset-6 rounded-[3rem] bg-[color:var(--color-secondary-glow)] blur-3xl" aria-hidden="true" />
                <RoutineCycleIllustration className="relative h-auto w-full" />
              </div>
            </div>
            <div className="order-1 space-y-6 lg:order-2">
              <p className="text-xs font-semibold tracking-[0.22em] text-[color:var(--color-accent-strong)] uppercase">
                {t('howItWorks.eyebrow')}
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-[color:var(--color-foreground)] sm:text-4xl lg:text-5xl lg:leading-[1.1]">
                {t('howItWorks.headline')}
              </h2>
              <p className="max-w-xl text-lg leading-8 text-[color:var(--color-muted)]">
                {t('howItWorks.illustrationBody')}
              </p>

              <ol className="mt-4 space-y-5">
                {steps.map((step, index) => (
                  <li
                    key={step.title}
                    className="flex gap-5 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 shadow-[var(--shadow-soft)]"
                  >
                    <span
                      aria-hidden="true"
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-accent-soft)] text-sm font-semibold text-[color:var(--color-accent-strong)]"
                    >
                      {index + 1}
                    </span>
                    <div className="space-y-1.5">
                      <h3 className="text-base font-semibold text-[color:var(--color-foreground)]">
                        {step.title}
                      </h3>
                      <p className="text-sm leading-6 text-[color:var(--color-muted)]">
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section
          id="features"
          className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28"
        >
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <p className="text-xs font-semibold tracking-[0.22em] text-[color:var(--color-accent-strong)] uppercase">
                {t('features.eyebrow')}
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-[color:var(--color-foreground)] sm:text-4xl lg:text-5xl lg:leading-[1.1]">
                {t('features.headline')}
              </h2>
              <p className="max-w-xl text-lg leading-8 text-[color:var(--color-muted)]">
                {t('features.illustrationBody')}
              </p>
            </div>
            <div className="relative">
              <div className="absolute -inset-6 rounded-[3rem] bg-[color:var(--color-accent-glow)] blur-3xl" aria-hidden="true" />
              <IngredientCheckIllustration className="relative h-auto w-full" />
            </div>
          </div>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => {
              const Icon = featureIconMap[feature.icon] ?? Package;
              return (
                <article
                  key={feature.title}
                  className="group rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-[color:var(--color-accent)]"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent-strong)] transition group-hover:scale-105">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight text-[color:var(--color-foreground)]">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--color-muted)]">
                    {feature.body}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="mx-auto w-full max-w-4xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28"
        >
          <div className="space-y-5 text-center">
            <p className="text-xs font-semibold tracking-[0.22em] text-[color:var(--color-accent-strong)] uppercase">
              {t('faq.eyebrow')}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-[color:var(--color-foreground)] sm:text-4xl lg:text-5xl lg:leading-[1.1]">
              {t('faq.headline')}
            </h2>
          </div>

          <div className="mt-12 space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-[var(--shadow-soft)] transition open:border-[color:var(--color-accent)]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-[color:var(--color-foreground)]">
                  <span>{faq.question}</span>
                  <span
                    aria-hidden="true"
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-border)] text-[color:var(--color-muted)] transition group-open:rotate-45 group-open:border-[color:var(--color-accent)] group-open:text-[color:var(--color-accent)]"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 text-sm leading-7 text-[color:var(--color-muted)]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section
          id="cta"
          className="mx-auto w-full max-w-7xl px-5 pb-20 sm:px-6 sm:pb-24 lg:px-8 lg:pb-28"
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-8 shadow-[var(--shadow-hero)] sm:p-12">
            <div
              aria-hidden="true"
              className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[color:var(--color-accent-glow)] blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[color:var(--color-secondary-glow)] blur-3xl"
            />
            <div className="relative grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
              <div className="space-y-5">
                <p className="text-xs font-semibold tracking-[0.22em] text-[color:var(--color-accent-strong)] uppercase">
                  {t('finalCta.eyebrow')}
                </p>
                <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-[color:var(--color-foreground)] sm:text-4xl lg:text-5xl lg:leading-[1.1]">
                  {t('finalCta.headline')}
                </h2>
                <p className="max-w-2xl text-lg leading-8 text-[color:var(--color-muted)]">
                  {t('finalCta.body')}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-foreground)] px-7 py-3.5 text-base font-semibold text-[color:var(--color-background)] shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-surface)]"
                >
                  {t('finalCta.ctaPrimary')}
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)] px-7 py-3.5 text-base font-semibold text-[color:var(--color-foreground)] transition hover:border-[color:var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-surface)]"
                >
                  {t('finalCta.ctaSecondary')}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
