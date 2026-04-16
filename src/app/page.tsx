import type { Metadata } from "next";
import {
  Boxes,
  Download,
  EyeOff,
  Globe,
  Layers,
  Lock,
  type LucideIcon,
  Package,
  ShieldCheck,
  Sparkles,
  Sun,
  Sunrise,
  User,
} from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { HomeRouteGuard } from "@/components/auth/home-route-guard";
import { LandingImage } from "@/components/landing/landing-image";
import { IngredientCheckIllustration } from "@/components/illustrations/ingredient-check";
import { RoutineCycleIllustration } from "@/components/illustrations/routine-cycle";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AppRoute } from "@/constants/app-routes";
import { siteConfig } from "@/lib/site";

import heroShelf from "../../public/images/landing/hero-shelf-01.jpg";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteConfig.name,
  applicationCategory: "HealthApplication",
  operatingSystem: "Web",
  description: siteConfig.description,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

const featureIconMap: Record<string, LucideIcon> = {
  package: Package,
  "shield-check": ShieldCheck,
  user: User,
  lock: Lock,
  globe: Globe,
  sunrise: Sunrise,
};

const privacyIconOrder: LucideIcon[] = [ShieldCheck, EyeOff, Lock, Download];
const differentiatorIconOrder: LucideIcon[] = [Boxes, Layers, Sun, Sparkles];

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

interface LabelledBody {
  title: string;
  body: string;
}

export default async function Home() {
  const t = await getTranslations("landing");

  const problems = t.raw("problems") as ProblemItem[];
  const steps = t.raw("steps") as StepItem[];
  const features = t.raw("featureItems") as FeatureItem[];
  const faqs = t.raw("faqItems") as FaqItem[];
  const privacyPoints = t.raw("privacy.points") as LabelledBody[];
  const differentiators = t.raw("differentiators.items") as LabelledBody[];

  return (
    <HomeRouteGuard>
      <div className="relative min-h-screen overflow-hidden">
        <SiteHeader />
        <main>
        {/* HERO — text + real landscape shelfie photo, photo stretches to text column height */}
        <section className="mx-auto w-full max-w-7xl px-5 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-24 lg:px-8 lg:pt-32 lg:pb-32">
          <div className="grid items-stretch gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
            <div className="animate-fade-up flex flex-col justify-center space-y-8">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-muted shadow-soft">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                {t("hero.badge")}
              </div>

              <div className="space-y-6">
                <h1 className="max-w-3xl text-balance text-4xl leading-[1.08] font-semibold tracking-tight text-foreground sm:text-5xl sm:leading-[1.06] lg:text-6xl lg:leading-[1.05]">
                  {t("hero.headline")}
                </h1>
                <p className="max-w-xl text-lg leading-8 text-muted sm:text-xl">
                  {t("hero.subheadline")}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={AppRoute.Register}
                  className="inline-flex items-center justify-center rounded-full bg-foreground px-7 py-3.5 text-base font-semibold text-background shadow-soft transition hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {t("hero.ctaPrimary")}
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-full border border-border-strong bg-surface px-7 py-3.5 text-base font-semibold text-foreground transition hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {t("hero.ctaSecondary")}
                </Link>
              </div>

              <div className="flex flex-wrap gap-2">
                {(["a", "b", "c"] as const).map((key) => (
                  <span
                    key={key}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-muted"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {t(`hero.pills.${key}`)}
                  </span>
                ))}
              </div>
            </div>

            {/* Hero photo — landscape 4:3 on mobile, stretches to text height on desktop */}
            <div className="animate-fade-up-delay-1 relative flex w-full items-stretch">
              <div
                aria-hidden="true"
                className="absolute -inset-8 rounded-[3rem] bg-accent-glow blur-3xl"
              />
              <LandingImage
                meaningful
                src={heroShelf}
                alt={t("hero.imageAlt")}
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 55vw, 620px"
                className="relative aspect-4/3 w-full lg:aspect-auto lg:h-full lg:min-h-105"
              />
            </div>
          </div>
        </section>

        {/* PROBLEM — cards only, no photo */}
        <section
          id="problem"
          className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 py-14 sm:scroll-mt-28 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
        >
          <div className="max-w-3xl space-y-5">
            <p className="text-xs font-semibold tracking-[0.22em] text-accent-strong uppercase">
              {t("problem.eyebrow")}
            </p>
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl lg:leading-[1.1]">
              {t("problem.headline")}
            </h2>
            <p className="max-w-2xl text-lg leading-8 text-muted">
              {t("problem.body")}
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:gap-8">
            {problems.map((problem, index) => (
              <article
                key={problem.title}
                className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-8 shadow-soft transition hover:-translate-y-0.5 hover:border-accent"
              >
                <span
                  aria-hidden="true"
                  className="text-5xl font-semibold tracking-tight text-accent"
                >
                  0{index + 1}
                </span>
                <h3 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
                  {problem.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-muted">
                  {problem.body}
                </p>
                <span
                  aria-hidden="true"
                  className="absolute right-0 bottom-0 h-16 w-16 translate-x-6 translate-y-6 rounded-full bg-accent-glow transition group-hover:scale-110"
                />
              </article>
            ))}
          </div>
        </section>

        {/* PRIVACY — full-width centred header + 2x2 grid that fills the page */}
        <section
          id="privacy"
          className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 py-20 sm:scroll-mt-28 sm:px-6 sm:py-24 lg:px-8 lg:py-28"
        >
          <div className="mx-auto max-w-3xl space-y-5 text-center">
            <p className="text-xs font-semibold tracking-[0.22em] text-accent-strong uppercase">
              {t("privacy.eyebrow")}
            </p>
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl lg:leading-[1.1]">
              {t("privacy.headline")}
            </h2>
            <p className="mx-auto max-w-2xl text-lg leading-8 text-muted">
              {t("privacy.body")}
            </p>
          </div>

          <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:gap-8">
            {privacyPoints.map((point, index) => {
              const Icon = privacyIconOrder[index] ?? ShieldCheck;
              return (
                <li
                  key={point.title}
                  className="flex gap-5 rounded-3xl border border-border bg-surface p-8 shadow-soft transition hover:-translate-y-0.5 hover:border-accent sm:p-10"
                >
                  <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent-strong">
                    <Icon className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <div className="space-y-2.5">
                    <p className="text-xl font-semibold text-foreground">
                      {point.title}
                    </p>
                    <p className="text-base leading-7 text-muted">
                      {point.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* HOW IT WORKS — text + RoutineCycleIllustration beside it */}
        <section
          id="how-it-works"
          className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 py-14 sm:scroll-mt-28 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
        >
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
            <div className="space-y-6">
              <p className="text-xs font-semibold tracking-[0.22em] text-accent-strong uppercase">
                {t("howItWorks.eyebrow")}
              </p>
              <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl lg:leading-[1.1]">
                {t("howItWorks.headline")}
              </h2>
              <p className="max-w-xl text-lg leading-8 text-muted">
                {t("howItWorks.illustrationBody")}
              </p>

              <ol className="mt-4 space-y-5">
                {steps.map((step, index) => (
                  <li
                    key={step.title}
                    className="flex gap-5 rounded-2xl border border-border bg-surface p-6 shadow-soft"
                  >
                    <span
                      aria-hidden="true"
                      className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-soft text-base font-semibold text-accent-strong"
                    >
                      {index + 1}
                    </span>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-base leading-7 text-muted">
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div
              aria-hidden="true"
              className="relative mx-auto w-full max-w-xl"
            >
              <div className="absolute -inset-6 rounded-[3rem] bg-secondary-glow blur-3xl" />
              <RoutineCycleIllustration className="relative h-auto w-full" />
            </div>
          </div>
        </section>

        {/* FEATURES — text + IngredientCheckIllustration, then card grid */}
        <section
          id="features"
          className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 py-14 sm:scroll-mt-28 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
        >
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
            <div className="space-y-6">
              <p className="text-xs font-semibold tracking-[0.22em] text-accent-strong uppercase">
                {t("features.eyebrow")}
              </p>
              <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl lg:leading-[1.1]">
                {t("features.headline")}
              </h2>
              <p className="max-w-xl text-lg leading-8 text-muted">
                {t("features.illustrationBody")}
              </p>
            </div>
            <div
              aria-hidden="true"
              className="relative mx-auto w-full max-w-lg"
            >
              <div className="absolute -inset-6 rounded-[3rem] bg-accent-glow blur-3xl" />
              <IngredientCheckIllustration className="relative h-auto w-full" />
            </div>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => {
              const Icon = featureIconMap[feature.icon] ?? Package;
              return (
                <article
                  key={feature.title}
                  className="group rounded-2xl border border-border bg-surface p-7 shadow-soft transition hover:-translate-y-0.5 hover:border-accent"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent-strong transition group-hover:scale-105">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-muted">
                    {feature.body}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* DIFFERENTIATORS — icon-led rows only, no photo */}
        <section
          id="differentiators"
          className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 py-14 sm:scroll-mt-28 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
        >
          <div className="rounded-3xl border border-border bg-surface p-8 shadow-soft sm:p-12">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs font-semibold tracking-[0.22em] text-accent-strong uppercase">
                {t("differentiators.eyebrow")}
              </p>
              <h2 className="max-w-3xl text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-4xl lg:leading-[1.1]">
                {t("differentiators.headline")}
              </h2>
            </div>

            <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:gap-10">
              {differentiators.map((item, index) => {
                const Icon = differentiatorIconOrder[index] ?? Sparkles;
                return (
                  <li key={item.title} className="flex gap-5">
                    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-strong">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-foreground">
                        {item.title}
                      </p>
                      <p className="text-base leading-7 text-muted">
                        {item.body}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="mx-auto w-full max-w-5xl scroll-mt-24 px-5 py-14 sm:scroll-mt-28 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
        >
          <div className="space-y-5 text-center">
            <p className="text-xs font-semibold tracking-[0.22em] text-accent-strong uppercase">
              {t("faq.eyebrow")}
            </p>
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
              {t("faq.headline")}
            </h2>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-border bg-surface p-7 shadow-soft transition open:border-accent"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-foreground">
                  <span>{faq.question}</span>
                  <span
                    aria-hidden="true"
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-lg text-muted transition group-open:rotate-45 group-open:border-accent group-open:text-accent"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 text-base leading-7 text-muted">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* FINAL CTA — text and buttons only, no photo */}
        <section
          id="cta"
          className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 pb-24 sm:scroll-mt-28 sm:px-6 sm:pb-28 lg:px-8 lg:pb-32"
        >
          <div className="relative overflow-hidden rounded-4xl border border-border bg-surface p-8 shadow-hero sm:p-12">
            <div
              aria-hidden="true"
              className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-accent-glow blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-secondary-glow blur-3xl"
            />
            <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-center lg:gap-12">
              <div className="space-y-5">
                <p className="text-xs font-semibold tracking-[0.22em] text-accent-strong uppercase">
                  {t("finalCta.eyebrow")}
                </p>
                <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl lg:leading-[1.1]">
                  {t("finalCta.headline")}
                </h2>
                <p className="max-w-2xl text-lg leading-8 text-muted">
                  {t("finalCta.body")}
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:max-w-md sm:flex-row lg:max-w-[20rem] lg:justify-self-end lg:flex-col lg:items-stretch">
                <Link
                  href={AppRoute.Register}
                  className="inline-flex items-center justify-center rounded-full bg-foreground px-7 py-3.5 text-base font-semibold text-background shadow-soft transition hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  {t("finalCta.ctaPrimary")}
                </Link>
                <Link
                  href={AppRoute.Login}
                  className="inline-flex items-center justify-center rounded-full border border-border-strong bg-background px-7 py-3.5 text-base font-semibold text-foreground transition hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  {t("finalCta.ctaSecondary")}
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
    </HomeRouteGuard>
  );
}
