import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Boxes,
  Calendar,
  Camera,
  Check,
  CloudSun,
  Download,
  EyeOff,
  Globe,
  HeartPulse,
  Lock,
  MapPin,
  MessageCircle,
  Plus,
  ScanSearch,
  Moon,
  Package,
  ScanFace,
  Server,
  ShieldCheck,
  Sparkles,
  Sun,
  Sunrise,
  ThumbsUp,
  Thermometer,
  User,
  UserCheck,
  UserCog,
  Users,
  Wand,
  Wind,
} from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ProductBottle } from './product-bottle';
import { AppRoute } from '@/constants/app-routes';
import styles from './landing.module.css';

interface ProblemItem {
  title: string;
  body: string;
}
interface ProblemStat {
  figure: string;
  body: string;
}
interface HowStep {
  title: string;
  body: string;
  hint: string;
}
interface FeatureItem {
  key: string;
  eyebrow: string;
  title: string;
  bullets: string[];
}
interface PrivacyPoint {
  title: string;
  body: string;
}
interface FlowStep {
  title: string;
  detail: string;
}
interface FaqItem {
  question: string;
  answer: string;
}
interface HeroPreviewCopy {
  suggestionTitle: string;
  suggestionTime: string;
  ready: string;
  morning: string;
  weather: string;
  photoLogged: string;
  cleanserHint: string;
  niacinamideHint: string;
  sunscreenHint: string;
  suggestionNote: string;
  journalTitle: string;
  journalSubtitle: string;
  ai: string;
  photoLabels: [string, string, string];
  redness: string;
  dryness: string;
}
interface HowItWorksVisualCopy {
  skinProfile: {
    title: string;
    step: string;
    chips: string[];
    progress: string;
  };
  shelf: {
    title: string;
    subtitle: string;
    items: Array<{
      badge: string;
      badgeTone?: 'finished';
      shape: 'pump' | 'dropper' | 'tube' | 'jar';
      tone: 'green' | 'cream' | 'aqua' | 'blush' | 'amber' | 'lavender';
      brand: string;
      name: string;
      sub: string;
    }>;
  };
  dayPlan: {
    title: string;
    subtitle: string;
    status: {
      ready: string;
      locked: string;
      done: string;
    };
    slots: Array<{
      daypart: 'morning' | 'noon' | 'evening';
      time: string;
      detail: string;
      state: 'ready' | 'locked' | 'done';
    }>;
  };
}
interface LandingFeatureVisualCopy {
  shelf: {
    title: string;
    subtitle: string;
    status: string;
    chips: string[];
    usedLabel: string;
    lastedLabel: string;
  };
  ingredients: {
    title: string;
    subtitle: string;
    cleanserRole: string;
    cleanserName: string;
    tonerRole: string;
    tonerName: string;
    tonerWarning: string;
    treatmentRole: string;
    treatmentName: string;
    treatmentWarning: string;
    alertTitle: string;
    alertBody: string;
    swap: string;
  };
  suggestions: {
    title: string;
    subtitle: string;
    aiTuned: string;
    question: string;
    ask: string;
    status: HowItWorksVisualCopy['dayPlan']['status'];
    slots: HowItWorksVisualCopy['dayPlan']['slots'];
  };
  journal: {
    title: string;
    subtitle: string;
    ai: string;
    photoLabels: [string, string, string];
    redness: string;
    dryness: string;
    irritation: string;
    reactionTitle: string;
    reactionBody: string;
  };
  quickCheck: {
    title: string;
    subtitle: string;
    brand: string;
    product: string;
    ingredients: string;
    verdictLabel: string;
    verdict: string;
    confidence: string;
    safetyLabel: string;
    warning: string;
    friendly: string;
    compare: string;
  };
  smartPicks: {
    title: string;
    subtitle: string;
    gapTitle: string;
    gapBody: string;
    save: string;
    picks: Array<{
      shape: 'pump' | 'dropper' | 'tube' | 'jar';
      tone: 'green' | 'cream' | 'aqua' | 'blush' | 'amber' | 'lavender';
      brand: string;
      name: string;
      tier: string;
      tierTone?: 'mid' | 'luxe';
      meta: string;
      featured?: boolean;
    }>;
  };
  climate: {
    title: string;
    subtitle: string;
    city: string;
    temperature: string;
    climate: string;
    uv: string;
    humidity: string;
    note: string;
  };
  community: {
    cardTitle: string;
    cardSubtitle: string;
    authorName: string;
    authorTags: string[];
    playbookTitle: string;
    playbookSubtitle: string;
    steps: string[];
    outcome: string;
    outcomeMixed: string;
    adaptCta: string;
  };
}

/* ====================================================================== */
/*                                   HERO                                  */
/* ====================================================================== */

export async function LandingHero() {
  const t = await getTranslations('landing.hero');
  const preview = t.raw('preview') as HeroPreviewCopy;

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto w-full max-w-7xl px-5 pt-10 pb-10 sm:px-6 sm:pt-12 sm:pb-12 lg:px-8 lg:pt-16 lg:pb-16">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-3 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-muted shadow-soft mb-6">
              <span className={styles.heroPingDot} />
              {t('badge')}
            </div>

            <h1 className="font-display max-w-[16ch] text-balance text-4xl leading-[1.04] font-bold tracking-tight text-foreground sm:text-5xl lg:text-[58px]">
              {t('headlineLead')}{' '}
              <span className={styles.heroAccent}>{t('headlineAccent')}</span>
            </h1>

            <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-muted sm:text-xl">
              {t('lead')}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={AppRoute.Register}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background shadow-soft transition hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-7 sm:py-3.5 sm:text-base"
              >
                {t('ctaPrimary')}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-full border border-border-strong bg-surface px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-7 sm:py-3.5 sm:text-base"
              >
                {t('ctaSecondary')}
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {(['a', 'b', 'c'] as const).map((key) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {t(`pills.${key}`)}
                </span>
              ))}
            </div>
          </div>

          <div className="animate-fade-up-delay-1 relative w-full min-h-[480px] lg:min-h-[580px]" aria-hidden="true">
            <div
              className="absolute -inset-10 rounded-[5rem] blur-3xl pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 30% 30%, var(--accent-glow), transparent 60%), radial-gradient(circle at 70% 80%, var(--secondary-glow), transparent 60%)',
              }}
            />

            {/* Primary card: Today's Suggestion */}
            <article
              className={`relative lg:absolute lg:top-0 lg:right-0 lg:w-[460px] z-10 rounded-[22px] border border-border bg-surface p-6 shadow-hero ${styles.heroFloatA}`}
            >
              <header className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-[15px] font-bold text-foreground">
                    {preview.suggestionTitle}
                  </p>
                  <p className="text-[11.5px] text-muted">
                    {preview.suggestionTime}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--note-cool-border)] bg-[color:var(--note-cool-bg)] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-[color:var(--note-cool-fg)]">
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  {preview.ready}
                </span>
              </header>

              <div className="mb-3 flex flex-wrap gap-1.5">
                <SummaryPill icon={<Sun className="h-3 w-3" />} tone="ready">
                  {preview.morning}
                </SummaryPill>
                <SummaryPill icon={<Thermometer className="h-3 w-3" />}>
                  {preview.weather}
                </SummaryPill>
                <SummaryPill icon={<Camera className="h-3 w-3" />}>
                  {preview.photoLogged}
                </SummaryPill>
              </div>

              <div className="flex flex-col gap-2">
                <MiniStep
                  applied
                  bottle={<ProductBottle shape="pump" tone="green" brand="CeraVe" />}
                  brand="CeraVe"
                  name="Hydrating Cleanser"
                  hint={
                    <>
                      <Check className="h-3 w-3" />
                      {preview.cleanserHint}
                    </>
                  }
                />
                <MiniStep
                  ai
                  bottle={<ProductBottle shape="dropper" tone="cream" brand="Ordinary" />}
                  brand="The Ordinary"
                  name="Niacinamide 10% + Zinc"
                  hint={
                    <>
                      <Sparkles className="h-3 w-3" />
                      {preview.niacinamideHint}
                    </>
                  }
                />
                <MiniStep
                  bottle={<ProductBottle shape="tube" tone="aqua" brand="LRP" />}
                  brand="La Roche-Posay"
                  name="Anthelios SPF 50"
                  hint={
                    <>
                      <Sun className="h-3 w-3" />
                      {preview.sunscreenHint}
                    </>
                  }
                />
              </div>

              <div className="mt-3 flex items-start gap-2 rounded-xl border border-[color:var(--ai-border)] bg-[color:var(--ai-soft)] px-3 py-2.5 text-xs leading-snug text-foreground">
                <Sparkles
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--ai-strong)]"
                  aria-hidden="true"
                />
                <span>{preview.suggestionNote}</span>
              </div>
            </article>

            {/* Secondary card: Skin Journal preview */}
            <article
              className={`relative mt-4 lg:absolute lg:bottom-0 lg:right-[18%] lg:mt-0 lg:w-[78%] lg:max-w-[340px] z-0 rounded-[22px] border border-border bg-surface p-5 shadow-hero ${styles.heroFloatB}`}
            >
              <header className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-[15px] font-bold text-foreground">
                    {preview.journalTitle}
                  </p>
                  <p className="text-[11.5px] text-muted">
                    {preview.journalSubtitle}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--ai-border)] bg-[color:var(--ai-bg)] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-[color:var(--ai-fg)]">
                  <ScanFace className="h-3 w-3" aria-hidden="true" />
                  {preview.ai}
                </span>
              </header>

              <div className="mb-3 grid grid-cols-3 gap-2">
                {preview.photoLabels.map((label) => (
                  <JournalPhoto key={label} label={label} />
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <Reading label={preview.redness} pct={60} tone="mid" score="3/5" />
                <Reading label={preview.dryness} pct={30} tone="low" score="1/5" />
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ====================================================================== */
/*                                TRUST STRIP                               */
/* ====================================================================== */

export async function LandingTrustStrip() {
  const t = await getTranslations('landing');
  const items = t.raw('trust') as string[];
  const icons = [ShieldCheck, Boxes, BadgeCheck, ScanFace, EyeOff, Globe];

  return (
    <section
      aria-label={t('trustLabel')}
      className="border-y border-border bg-surface/60"
    >
      <div className="mx-auto w-full max-w-7xl px-5 py-5 sm:px-6 lg:px-8">
        <ul className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-sm font-medium text-muted">
          {items.map((item, i) => {
            const Icon = icons[i] ?? ShieldCheck;
            return (
              <li
                key={item}
                className="inline-flex items-center gap-2 whitespace-nowrap"
              >
                <Icon
                  className="h-3.5 w-3.5 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ====================================================================== */
/*                                  PROBLEM                                 */
/* ====================================================================== */

export async function LandingProblem() {
  const t = await getTranslations('landing.problem');
  const problems = t.raw('problems') as ProblemItem[];
  const stats = t.raw('stats') as ProblemStat[];

  return (
    <section id="problem" className="scroll-mt-24 sm:scroll-mt-28">
      <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <Eyebrow>{t('eyebrow')}</Eyebrow>
          <h2 className="font-display mt-4 max-w-[24ch] text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[44px] lg:leading-[1.1]">
            {t('headline')}
          </h2>
          <p className="mt-4 max-w-[56ch] text-base leading-relaxed text-muted sm:text-lg">
            {t('body')}
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-3 sm:gap-6">
          {problems.map((problem, i) => (
            <article
              key={problem.title}
              className="group relative overflow-hidden rounded-3xl border border-border bg-surface p-8 shadow-soft transition hover:-translate-y-1 hover:border-accent hover:shadow-hero"
            >
              <span className="font-display text-[44px] font-bold leading-none tracking-tight text-accent">
                0{i + 1}
              </span>
              <h3 className="font-display mt-5 text-[22px] font-bold tracking-tight text-foreground">
                {problem.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                {problem.body}
              </p>
              <span
                aria-hidden="true"
                className="absolute -right-10 -bottom-10 h-36 w-36 rounded-full bg-accent-glow blur-2xl transition group-hover:scale-110"
              />
            </article>
          ))}
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {stats.map((stat) => (
            <div
              key={stat.figure}
              className="flex items-center gap-5 rounded-2xl border border-border bg-surface-muted px-6 py-5"
            >
              <span className="font-display text-4xl font-bold tracking-tight text-foreground">
                {stat.figure}
              </span>
              <span className="text-sm leading-relaxed text-muted">{stat.body}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ====================================================================== */
/*                                HOW IT WORKS                              */
/* ====================================================================== */

export async function LandingHowItWorks() {
  const t = await getTranslations('landing.howItWorks');
  const steps = t.raw('steps') as HowStep[];
  const visuals = t.raw('visuals') as HowItWorksVisualCopy;
  const hintIcons = [UserCog, Package, Sunrise];

  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 sm:scroll-mt-28"
      style={{
        background: 'color-mix(in srgb, var(--surface-muted) 40%, var(--background))',
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow centered>{t('eyebrow')}</Eyebrow>
          <h2 className="font-display mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[44px] lg:leading-[1.1]">
            {t('headline')}
          </h2>
          <p className="mx-auto mt-4 max-w-[56ch] text-base leading-relaxed text-muted sm:text-lg">
            {t('lead')}
          </p>
        </div>

        <div className="mt-14 space-y-16 sm:space-y-20">
          <HowStep
            number={1}
            step={steps[0]}
            stepLabel={t('stepLabel', { number: 1 })}
            HintIcon={hintIcons[0]}
            visual={<SkinProfileCard copy={visuals.skinProfile} />}
          />
          <HowStep
            number={2}
            step={steps[1]}
            stepLabel={t('stepLabel', { number: 2 })}
            HintIcon={hintIcons[1]}
            reverse
            visual={<ShelfGridCard copy={visuals.shelf} />}
          />
          <HowStep
            number={3}
            step={steps[2]}
            stepLabel={t('stepLabel', { number: 3 })}
            HintIcon={hintIcons[2]}
            visual={<DayPlanCard copy={visuals.dayPlan} />}
          />
        </div>
      </div>
    </section>
  );
}

function HowStep({
  number,
  step,
  stepLabel,
  HintIcon,
  reverse,
  visual,
}: {
  number: number;
  step: HowStep;
  stepLabel: string;
  HintIcon: typeof Sun;
  reverse?: boolean;
  visual: React.ReactNode;
}) {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-20">
      <div className={reverse ? 'lg:order-2' : ''}>
        <p className="font-display inline-flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-accent-strong">
          <span className="inline-grid h-9 w-9 place-items-center rounded-full bg-accent-soft font-bold text-accent-strong">
            {number}
          </span>
          {stepLabel}
        </p>
        <h3 className="font-display mt-4 text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
          {step.title}
        </h3>
        <p className="mt-4 max-w-[44ch] text-base leading-relaxed text-muted sm:text-[17px]">
          {step.body}
        </p>
        <p className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-accent-strong">
          <HintIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {step.hint}
        </p>
      </div>
      <div className={`relative ${reverse ? 'lg:order-1' : ''}`}>
        <div
          className="absolute -inset-7 rounded-[3rem] blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, var(--accent-glow), transparent 60%)',
          }}
        />
        <div className="relative">{visual}</div>
      </div>
    </div>
  );
}

/* ====================================================================== */
/*                                 FEATURES                                 */
/* ====================================================================== */

export async function LandingFeatures() {
  const t = await getTranslations('landing.features');
  const items = t.raw('items') as FeatureItem[];
  const visuals = t.raw('visuals') as LandingFeatureVisualCopy;

  return (
    <section id="features" className="scroll-mt-24 sm:scroll-mt-28">
      <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow centered>{t('eyebrow')}</Eyebrow>
          <h2 className="font-display mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[44px] lg:leading-[1.1]">
            {t('headline')}
          </h2>
          <p className="mx-auto mt-4 max-w-[56ch] text-base leading-relaxed text-muted sm:text-lg">
            {t('lead')}
          </p>
        </div>

        <div className="mt-12 divide-y divide-border">
          {items.map((feature, i) => (
            <FeatureBand
              key={feature.key}
              feature={feature}
              reverse={i % 2 === 1}
              visuals={visuals}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureBand({
  feature,
  reverse,
  visuals,
}: {
  feature: FeatureItem;
  reverse: boolean;
  visuals: LandingFeatureVisualCopy;
}) {
  return (
    <article className="grid items-center gap-10 py-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20 lg:py-20">
      <div className={reverse ? 'lg:order-2' : ''}>
        <Eyebrow>{feature.eyebrow}</Eyebrow>
        <h3 className="font-display mt-4 max-w-[20ch] text-balance text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-[38px] lg:leading-[1.12]">
          {feature.title}
        </h3>
        <ul className="mt-6 flex flex-col gap-3 text-sm text-foreground">
          {feature.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2.5">
              <Check
                className="mt-1 h-4 w-4 shrink-0 text-accent"
                aria-hidden="true"
              />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={`relative ${reverse ? 'lg:order-1' : ''}`}>
        <div
          className="absolute -inset-6 rounded-[3rem] blur-3xl pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 30% 40%, var(--accent-glow), transparent 60%), radial-gradient(circle at 70% 60%, var(--secondary-glow), transparent 60%)',
          }}
        />
        <div className="relative">
          {feature.key === 'shelf' && <ShelfDetailCard copy={visuals.shelf} />}
          {feature.key === 'ingredients' && (
            <ConflictCard copy={visuals.ingredients} />
          )}
          {feature.key === 'suggestions' && (
            <TimelineCard copy={visuals.suggestions} />
          )}
          {feature.key === 'community' && (
            <CommunityCard copy={visuals.community} />
          )}
          {feature.key === 'journal' && <JournalCard copy={visuals.journal} />}
          {feature.key === 'quickCheck' && (
            <QuickCheckCard copy={visuals.quickCheck} />
          )}
          {feature.key === 'smartPicks' && (
            <SmartPicksCard copy={visuals.smartPicks} />
          )}
          {feature.key === 'climate' && <ClimateCard copy={visuals.climate} />}
        </div>
      </div>
    </article>
  );
}

/* ====================================================================== */
/*                                   PRIVACY                                */
/* ====================================================================== */

export async function LandingPrivacy() {
  const t = await getTranslations('landing.privacy');
  const points = t.raw('points') as PrivacyPoint[];
  const flow = t.raw('flow') as FlowStep[];
  const flowIcons = [Camera, Lock, Server, UserCheck, Download];

  return (
    <section
      id="privacy"
      className="scroll-mt-24 border-y border-border bg-surface-muted/60 sm:scroll-mt-28"
    >
      <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <Eyebrow>{t('eyebrow')}</Eyebrow>
            <h2 className="font-display mt-4 max-w-[24ch] text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[44px] lg:leading-[1.1]">
              {t('headline')}
            </h2>
            <p className="mt-4 max-w-[56ch] text-base leading-relaxed text-muted sm:text-lg">
              {t('lead')}
            </p>
            <ul className="mt-8 grid gap-3.5 sm:grid-cols-2">
              {points.map((point) => (
                <li key={point.title} className="flex items-start gap-2.5 text-sm text-foreground">
                  <ShieldCheck
                    className="mt-1 h-4 w-4 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  <span>
                    <strong className="font-semibold">{point.title}</strong>{' '}
                    {point.body}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative rounded-3xl border border-border bg-surface p-6 shadow-soft sm:p-8">
            <ol>
              {flow.map((step, i) => {
                const Icon = flowIcons[i] ?? ShieldCheck;
                return (
                  <li
                    key={step.title}
                    className={`relative flex items-start gap-3.5 py-3.5 ${
                      i > 0 ? styles.flowStep : ''
                    }`}
                  >
                    <span className="relative z-10 inline-grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-strong">
                      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                    </span>
                    <div className="pt-1.5">
                      <p className="text-[14.5px] font-bold text-foreground">
                        {step.title}
                      </p>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted">
                        {step.detail}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ====================================================================== */
/*                                   FAQ                                    */
/* ====================================================================== */

export async function LandingFaq() {
  const t = await getTranslations('landing.faq');
  const items = t.raw('items') as FaqItem[];

  return (
    <section id="faq" className="scroll-mt-24 sm:scroll-mt-28">
      <div className="mx-auto w-full max-w-5xl px-5 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="text-center">
          <Eyebrow centered>{t('eyebrow')}</Eyebrow>
          <h2 className="font-display mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[44px] lg:leading-[1.1]">
            {t('headline')}
          </h2>
        </div>

        <div className="mx-auto mt-12 flex max-w-3xl flex-col gap-3">
          {items.map((item) => (
            <details
              key={item.question}
              className="group overflow-hidden rounded-2xl border border-border bg-surface shadow-soft transition open:border-accent"
            >
              <summary className="font-display flex cursor-pointer list-none items-center justify-between gap-5 px-6 py-5 text-base font-bold text-foreground sm:text-lg">
                <span>{item.question}</span>
                <span
                  aria-hidden="true"
                  className="inline-grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border text-muted transition group-open:rotate-45 group-open:border-accent group-open:bg-accent-soft group-open:text-accent-strong"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </span>
              </summary>
              <div className="px-6 pb-6 text-[15px] leading-relaxed text-muted">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ====================================================================== */
/*                                  FINAL CTA                               */
/* ====================================================================== */

export async function LandingFinalCta() {
  const t = await getTranslations('landing.finalCta');
  const trust = t.raw('trust') as string[];

  return (
    <section className="mx-auto w-full max-w-7xl px-5 pb-14 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20">
      <div className="relative overflow-hidden rounded-[32px] border border-border bg-surface px-10 py-14 text-center shadow-hero sm:px-16 sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-accent-glow blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -bottom-28 h-80 w-80 rounded-full bg-secondary-glow blur-3xl"
        />
        <h2 className="font-display relative mx-auto max-w-[18ch] text-balance text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-[52px] lg:leading-[1.08]">
          {t('headline')}
        </h2>
        <p className="relative mx-auto mt-5 max-w-[56ch] text-base leading-relaxed text-muted sm:text-lg">
          {t('body')}
        </p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={AppRoute.Register}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background shadow-soft transition hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface sm:px-7 sm:py-3.5 sm:text-base"
          >
            {t('ctaPrimary')}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href={AppRoute.Login}
            className="inline-flex items-center justify-center rounded-full border border-border-strong bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface sm:px-7 sm:py-3.5 sm:text-base"
          >
            {t('ctaSecondary')}
          </Link>
        </div>
        <div className="relative mt-6 inline-flex flex-wrap justify-center gap-4 text-sm text-muted">
          {trust.map((line) => (
            <span key={line} className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              {line}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ====================================================================== */
/*                            Shared primitives                             */
/* ====================================================================== */

function Eyebrow({ children, centered }: { children: React.ReactNode; centered?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong ${
        centered ? 'justify-center' : ''
      }`}
    >
      <span className="h-px w-4 bg-accent" aria-hidden="true" />
      {children}
    </span>
  );
}

function SummaryPill({
  icon,
  tone,
  children,
}: {
  icon: React.ReactNode;
  tone?: 'ready';
  children: React.ReactNode;
}) {
  const toneClass =
    tone === 'ready'
      ? 'border-[color:var(--note-cool-border)] bg-[color:var(--note-cool-bg)] text-[color:var(--note-cool-fg)]'
      : 'border-border bg-surface text-foreground';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${toneClass} px-2.5 py-1 text-[11.5px] font-medium`}
    >
      <span className="text-muted">{icon}</span>
      {children}
    </span>
  );
}

function MiniStep({
  applied,
  ai,
  bottle,
  brand,
  name,
  hint,
}: {
  applied?: boolean;
  ai?: boolean;
  bottle: React.ReactNode;
  brand: string;
  name: string;
  hint?: React.ReactNode;
}) {
  let bgClass = 'bg-surface-muted border-transparent';
  if (applied) {
    bgClass = 'border-transparent';
  }
  if (ai) {
    bgClass = 'border-[color:var(--ai-border)]';
  }
  const styleObj: React.CSSProperties = applied
    ? { background: 'color-mix(in srgb, var(--surface-muted) 65%, var(--accent-soft))' }
    : ai
      ? { background: 'color-mix(in srgb, var(--surface-muted) 70%, var(--ai-soft))' }
      : {};
  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border ${bgClass} p-2.5`}
      style={styleObj}
    >
      <div className="h-[46px] w-9 shrink-0">{bottle}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[9.5px] font-bold uppercase tracking-wider text-muted">
          {brand}
        </p>
        <p className="mt-0.5 text-[13px] font-semibold leading-tight text-foreground">
          {name}
        </p>
        {hint ? (
          <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted">
            {hint}
          </p>
        ) : null}
      </div>
      {applied ? (
        <span className="inline-grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full bg-accent text-background">
          <Check className="h-3 w-3" aria-hidden="true" />
        </span>
      ) : null}
    </div>
  );
}

function JournalPhoto({ label }: { label: string }) {
  return (
    <div className={styles.journalPhoto}>
      <span className="absolute bottom-1.5 left-1.5 inline-flex rounded-full bg-foreground/40 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-background backdrop-blur-sm">
        {label}
      </span>
    </div>
  );
}

function Reading({
  label,
  pct,
  tone,
  score,
}: {
  label: string;
  pct: number;
  tone: 'high' | 'mid' | 'low';
  score: string;
}) {
  const colors = {
    high: 'bg-danger',
    mid: 'bg-warning',
    low: 'bg-accent',
  } as const;
  return (
    <div className="flex items-center gap-3 text-[12.5px]">
      <span className="w-20 font-medium text-muted">{label}</span>
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
        <span
          className={`block h-full rounded-full ${colors[tone]}`}
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="min-w-[28px] text-right text-xs font-bold text-foreground">
        {score}
      </span>
    </div>
  );
}

/* ====================================================================== */
/*               Section visuals — How it works (steps 1-3)                 */
/* ====================================================================== */

function SkinProfileCard({ copy }: { copy: HowItWorksVisualCopy['skinProfile'] }) {
  return (
    <div className="rounded-[22px] border border-border bg-surface p-6 shadow-soft">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[15px] font-bold text-foreground">
            {copy.title}
          </p>
          <p className="text-[11.5px] text-muted">{copy.step}</p>
        </div>
        <span
          className="inline-grid h-8 w-8 place-items-center rounded-lg text-background"
          style={{
            background: 'linear-gradient(140deg, var(--accent), var(--accent-strong))',
          }}
        >
          <User className="h-4 w-4" aria-hidden="true" />
        </span>
      </header>
      <div className="mb-2.5 flex flex-wrap gap-1.5">
        <Chip tone="accent">{copy.chips[0]}</Chip>
        <Chip>{copy.chips[1]}</Chip>
        <Chip icon={<MapPin className="h-3 w-3" />}>{copy.chips[2]}</Chip>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Chip tone="warm">{copy.chips[3]}</Chip>
        <Chip tone="warm">{copy.chips[4]}</Chip>
        <Chip>{copy.chips[5]}</Chip>
        <Chip>{copy.chips[6]}</Chip>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
          <span
            className="block h-full rounded-full"
            style={{
              width: '64%',
              background: 'linear-gradient(90deg, var(--accent), var(--accent-strong))',
            }}
          />
        </span>
        <span className="text-xs font-bold text-accent-strong">
          {copy.progress}
        </span>
      </div>
    </div>
  );
}

function Chip({
  children,
  tone,
  icon,
}: {
  children: React.ReactNode;
  tone?: 'accent' | 'warm';
  icon?: React.ReactNode;
}) {
  let cls = 'border-border bg-surface-muted text-foreground';
  if (tone === 'accent')
    cls = 'border-[rgba(47,122,82,0.28)] bg-accent-soft text-accent-strong';
  if (tone === 'warm')
    cls = 'border-[rgba(180,99,59,0.28)] bg-secondary-soft text-[#7c3a18]';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${cls} px-2.5 py-1 text-[11.5px] font-medium`}
    >
      {icon ? <span className="text-muted">{icon}</span> : null}
      {children}
    </span>
  );
}

function ShelfGridCard({ copy }: { copy: HowItWorksVisualCopy['shelf'] }) {
  return (
    <div className="rounded-[22px] border border-border bg-surface p-6 shadow-soft">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[15px] font-bold text-foreground">
            {copy.title}
          </p>
          <p className="text-[11.5px] text-muted">{copy.subtitle}</p>
        </div>
        <span
          className="inline-grid h-8 w-8 place-items-center rounded-lg text-background"
          style={{
            background: 'linear-gradient(140deg, var(--accent), var(--accent-strong))',
          }}
        >
          <Package className="h-4 w-4" aria-hidden="true" />
        </span>
      </header>
      <div className="grid grid-cols-3 gap-2">
        {copy.items.map((item) => (
          <div
            key={item.name}
            className="relative flex flex-col items-center rounded-xl border border-border bg-surface-muted p-2.5 pt-7"
          >
            <span
              className={`absolute right-1.5 top-1.5 z-10 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                item.badgeTone === 'finished'
                  ? 'border border-border bg-surface text-muted'
                  : 'bg-accent-soft text-accent-strong'
              }`}
            >
              {item.badge}
            </span>
            <ProductBottle
              shape={item.shape}
              tone={item.tone}
              brand={item.brand}
              size="md"
              className="mb-2"
              style={{ width: 56, height: 72 }}
            />
            <p className="w-full truncate text-center text-[11px] font-semibold leading-tight text-foreground">
              {item.name}
            </p>
            <p className="w-full truncate text-center text-[10px] text-muted">
              {item.sub}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DayPlanCard({ copy }: { copy: HowItWorksVisualCopy['dayPlan'] }) {
  return (
    <div className="rounded-[22px] border border-border bg-surface p-6 shadow-soft">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[15px] font-bold text-foreground">
            {copy.title}
          </p>
          <p className="text-[11.5px] text-muted">{copy.subtitle}</p>
        </div>
        <span
          className="inline-grid h-8 w-8 place-items-center rounded-lg text-background"
          style={{
            background: 'linear-gradient(140deg, var(--accent), var(--accent-strong))',
          }}
        >
          <Calendar className="h-4 w-4" aria-hidden="true" />
        </span>
      </header>
      <div className="flex flex-col gap-3">
        {copy.slots.map((slot) => (
          <TimelineSlot
            key={slot.time}
            daypart={slot.daypart}
            time={slot.time}
            detail={slot.detail}
            state={slot.state}
            stateLabel={copy.status[slot.state]}
          />
        ))}
      </div>
    </div>
  );
}

function TimelineSlot({
  daypart,
  time,
  detail,
  state,
  stateLabel,
}: {
  daypart: 'morning' | 'noon' | 'evening';
  time: string;
  detail: string;
  state: 'ready' | 'locked' | 'done';
  stateLabel: string;
}) {
  const daypartStyles: Record<
    'morning' | 'noon' | 'evening',
    { bg: string; fg: string; icon: React.ReactNode }
  > = {
    morning: {
      bg: 'var(--daypart-morning-bg)',
      fg: 'var(--daypart-morning-fg)',
      icon: <Sunrise className="h-4 w-4" />,
    },
    noon: {
      bg: 'var(--daypart-noon-bg)',
      fg: 'var(--daypart-noon-fg)',
      icon: <Sun className="h-4 w-4" />,
    },
    evening: {
      bg: 'var(--daypart-evening-bg)',
      fg: 'var(--daypart-evening-fg)',
      icon: <Moon className="h-4 w-4" />,
    },
  };
  const dp = daypartStyles[daypart];
  const stateChip: Record<typeof state, { cls: string; icon: React.ReactNode }> = {
    ready: {
      cls: 'border-[color:var(--note-cool-border)] bg-[color:var(--note-cool-bg)] text-[color:var(--note-cool-fg)]',
      icon: <Sparkles className="h-3 w-3" />,
    },
    locked: {
      cls: 'border-border bg-surface-muted text-muted',
      icon: <Lock className="h-3 w-3" />,
    },
    done: {
      cls: 'border-[rgba(47,122,82,0.32)] bg-accent-soft text-accent-strong',
      icon: <Check className="h-3 w-3" />,
    },
  };
  const chip = stateChip[state];
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border bg-surface p-3.5 ${
        state === 'ready' ? 'border-accent shadow-[0_0_0_3px_var(--accent-soft)]' : 'border-border'
      }`}
    >
      <span
        className="inline-grid h-9 w-9 shrink-0 place-items-center rounded-xl"
        style={{ background: dp.bg, color: dp.fg }}
      >
        {dp.icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{time}</p>
        <p className="mt-0.5 text-[12.5px] text-muted">{detail}</p>
      </div>
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider ${chip.cls}`}
      >
        {chip.icon}
        {stateLabel}
      </span>
    </div>
  );
}

/* ====================================================================== */
/*               Section visuals — Feature bands (1-6)                      */
/* ====================================================================== */

function ShelfDetailCard({
  copy,
}: {
  copy: LandingFeatureVisualCopy['shelf'];
}) {
  return (
    <div className="rounded-[22px] border border-border bg-surface p-6 shadow-soft">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[15px] font-bold text-foreground">
            {copy.title}
          </p>
          <p className="text-[11.5px] text-muted">{copy.subtitle}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(47,122,82,0.32)] bg-accent-soft px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-accent-strong">
          <Check className="h-3 w-3" aria-hidden="true" />
          {copy.status}
        </span>
      </header>
      <div className="grid grid-cols-[96px_1fr] items-center gap-3.5">
        <ProductBottle
          shape="pump"
          tone="green"
          brand="CeraVe"
          brandSub="Hydrating Cleanser"
          size="lg"
          className="rounded-xl"
          style={{ width: 96, height: 120 }}
        />
        <div>
          <div className="flex flex-wrap gap-1">
            {copy.chips.map((chip) => (
              <DetailChip key={chip}>{chip}</DetailChip>
            ))}
          </div>
          <div className="mt-3">
            <Reading label={copy.usedLabel} pct={62} tone="low" score="62%" />
          </div>
          <div className="mt-2">
            <Reading label={copy.lastedLabel} pct={80} tone="mid" score="~ 5 mo" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-surface px-2 py-0.5 text-[10.5px] font-medium text-muted">
      {children}
    </span>
  );
}

function ConflictCard({
  copy,
}: {
  copy: LandingFeatureVisualCopy['ingredients'];
}) {
  return (
    <div className="rounded-[22px] border border-border bg-surface p-6 shadow-soft">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[15px] font-bold text-foreground">
            {copy.title}
          </p>
          <p className="text-[11.5px] text-muted">{copy.subtitle}</p>
        </div>
        <span
          className="inline-grid h-8 w-8 place-items-center rounded-lg text-background"
          style={{
            background: 'linear-gradient(140deg, var(--warning), #d97706)',
          }}
        >
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        </span>
      </header>
      <div className="flex flex-col gap-2">
        <MiniStep
          bottle={<ProductBottle shape="pump" tone="green" brand="CeraVe" />}
          brand={copy.cleanserRole}
          name={copy.cleanserName}
        />
        <div
          className="flex items-center gap-2.5 rounded-xl border p-2.5"
          style={{
            borderColor: 'rgba(184, 84, 10, 0.45)',
            background: 'var(--warning-soft)',
          }}
        >
          <div className="h-[46px] w-9 shrink-0">
            <ProductBottle shape="dropper" tone="amber" brand="AHA 7%" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9.5px] font-bold uppercase tracking-wider text-muted">
              {copy.tonerRole}
            </p>
            <p className="mt-0.5 text-[13px] font-semibold leading-tight text-foreground">
              {copy.tonerName}
            </p>
            <p
              className="mt-1 inline-flex items-center gap-1 text-[11px]"
              style={{ color: 'var(--warning)' }}
            >
              <AlertTriangle className="h-2.5 w-2.5" aria-hidden="true" />
              {copy.tonerWarning}
            </p>
          </div>
        </div>
        <div
          className="flex items-center gap-2.5 rounded-xl border p-2.5"
          style={{
            borderColor: 'rgba(184, 84, 10, 0.45)',
            background: 'var(--warning-soft)',
          }}
        >
          <div className="h-[46px] w-9 shrink-0">
            <ProductBottle shape="dropper" tone="blush" brand="Paula's" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9.5px] font-bold uppercase tracking-wider text-muted">
              {copy.treatmentRole}
            </p>
            <p className="mt-0.5 text-[13px] font-semibold leading-tight text-foreground">
              {copy.treatmentName}
            </p>
            <p
              className="mt-1 inline-flex items-center gap-1 text-[11px]"
              style={{ color: 'var(--warning)' }}
            >
              <AlertTriangle className="h-2.5 w-2.5" aria-hidden="true" />
              {copy.treatmentWarning}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-3 rounded-2xl border bg-[color:var(--warning-soft)] p-3.5"
           style={{ borderColor: 'rgba(184, 84, 10, 0.3)' }}>
        <span
          className="inline-grid h-9 w-9 shrink-0 place-items-center rounded-xl"
          style={{
            background: 'rgba(184, 84, 10, 0.18)',
            color: 'var(--warning)',
          }}
        >
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        </span>
        <div
          className="text-[12.5px] leading-snug"
          style={{ color: 'var(--note-warm-fg)' }}
        >
          <p className="mb-1 font-bold" style={{ color: 'var(--warning)' }}>
            {copy.alertTitle}
          </p>
          {copy.alertBody}
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-2 text-foreground">
            <Sparkles className="h-3 w-3 shrink-0 text-accent" aria-hidden="true" />
            <span className="text-[12px]">{copy.swap}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineCard({
  copy,
}: {
  copy: LandingFeatureVisualCopy['suggestions'];
}) {
  return (
    <div className="rounded-[22px] border border-border bg-surface p-6 shadow-soft">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[15px] font-bold text-foreground">
            {copy.title}
          </p>
          <p className="text-[11.5px] text-muted">{copy.subtitle}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--ai-border)] bg-[color:var(--ai-bg)] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-[color:var(--ai-fg)]">
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          {copy.aiTuned}
        </span>
      </header>
      <div className="flex flex-col gap-3">
        {copy.slots.map((slot) => (
          <TimelineSlot
            key={slot.time}
            daypart={slot.daypart}
            time={slot.time}
            detail={slot.detail}
            state={slot.state}
            stateLabel={copy.status[slot.state]}
          />
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-[color:var(--ai-border)] bg-[color:var(--ai-soft)] p-3.5">
        <span
          className="inline-grid h-8 w-8 shrink-0 place-items-center rounded-xl text-background"
          style={{ background: 'var(--ai-strong)' }}
        >
          <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <span className="flex-1 text-[13px] italic text-foreground">
          {copy.question}
        </span>
        <span
          className="inline-flex items-center rounded-full border border-[color:var(--ai-border)] bg-surface px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider"
          style={{ color: 'var(--ai-strong)' }}
        >
          {copy.ask}
        </span>
      </div>
    </div>
  );
}

function CommunityCard({
  copy,
}: {
  copy: LandingFeatureVisualCopy['community'];
}) {
  // Author initials for the avatar circle.
  const initials = copy.authorName
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="rounded-[22px] border border-border bg-surface p-6 shadow-soft">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[15px] font-bold text-foreground">
            {copy.cardTitle}
          </p>
          <p className="text-[11.5px] text-muted">{copy.cardSubtitle}</p>
        </div>
        <span
          className="inline-grid h-8 w-8 place-items-center rounded-lg text-background"
          style={{
            background:
              'linear-gradient(140deg, var(--accent), var(--accent-strong))',
          }}
        >
          <Users className="h-4 w-4" aria-hidden="true" />
        </span>
      </header>

      {/* Author row: avatar initials + skin-profile tags so the visual
          immediately communicates "this is from someone similar to me". */}
      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-border bg-surface-muted p-3">
        <span className="inline-grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-soft text-[12px] font-bold text-accent-strong">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold leading-tight text-foreground">
            {copy.authorName}
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            {copy.authorTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-surface px-1.5 py-0.5 text-[9.5px] font-medium text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Playbook title + step chips */}
      <p className="font-display text-[16px] font-bold leading-tight text-foreground">
        {copy.playbookTitle}
      </p>
      <p className="mt-1 text-[12.5px] text-muted">{copy.playbookSubtitle}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {copy.steps.map((step) => (
          <span
            key={step}
            className="inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-foreground"
          >
            {step}
          </span>
        ))}
      </div>

      {/* Outcome signals: positive count + mixed-results chip */}
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-[rgba(47,122,82,0.28)] bg-accent-soft px-3 py-2">
        <ThumbsUp
          className="h-3.5 w-3.5 shrink-0 text-accent-strong"
          aria-hidden="true"
        />
        <span className="text-[11.5px] font-semibold text-accent-strong">
          {copy.outcome}
        </span>
        <span className="text-[11px] text-muted">· {copy.outcomeMixed}</span>
      </div>

      {/* Adapt-to-shelf CTA — the key conversion moment of the community */}
      <button
        type="button"
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-accent bg-accent-soft px-3 py-2 text-[12.5px] font-semibold text-accent-strong"
      >
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        {copy.adaptCta}
      </button>
    </div>
  );
}

function JournalCard({
  copy,
}: {
  copy: LandingFeatureVisualCopy['journal'];
}) {
  return (
    <div className="rounded-[22px] border border-border bg-surface p-6 shadow-soft">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[15px] font-bold text-foreground">
            {copy.title}
          </p>
          <p className="text-[11.5px] text-muted">{copy.subtitle}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--ai-border)] bg-[color:var(--ai-bg)] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-[color:var(--ai-fg)]">
          <ScanFace className="h-3 w-3" aria-hidden="true" />
          {copy.ai}
        </span>
      </header>
      <div className="mb-3 grid grid-cols-3 gap-2">
        {copy.photoLabels.map((label) => (
          <JournalPhoto key={label} label={label} />
        ))}
      </div>
      <div className="mb-4 flex flex-col gap-2">
        <Reading label={copy.redness} pct={60} tone="mid" score="3/5" />
        <Reading label={copy.dryness} pct={30} tone="low" score="1/5" />
        <Reading label={copy.irritation} pct={22} tone="low" score="1/5" />
      </div>
      <div
        className="flex gap-3 rounded-2xl border p-3.5"
        style={{
          borderColor: 'rgba(179, 38, 30, 0.28)',
          background: 'var(--danger-soft)',
        }}
      >
        <span
          className="inline-grid h-8 w-8 shrink-0 place-items-center rounded-xl"
          style={{
            background: 'rgba(179, 38, 30, 0.18)',
            color: 'var(--danger)',
          }}
        >
          <HeartPulse className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[14px] font-bold" style={{ color: 'var(--danger)' }}>
            {copy.reactionTitle}
          </p>
          <p className="mt-0.5 text-[12.5px] leading-snug text-muted">
            {copy.reactionBody}
          </p>
        </div>
      </div>
    </div>
  );
}

function QuickCheckCard({
  copy,
}: {
  copy: LandingFeatureVisualCopy['quickCheck'];
}) {
  return (
    <div className="rounded-[22px] border border-border bg-surface p-6 shadow-soft">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[15px] font-bold text-foreground">
            {copy.title}
          </p>
          <p className="text-[11.5px] text-muted">{copy.subtitle}</p>
        </div>
        <span
          className="inline-grid h-8 w-8 place-items-center rounded-lg text-background"
          style={{
            background: 'linear-gradient(140deg, var(--accent), var(--accent-strong))',
          }}
        >
          <ScanSearch className="h-4 w-4" aria-hidden="true" />
        </span>
      </header>

      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-border bg-surface-muted p-3">
        <div className="h-[52px] w-10 shrink-0">
          <ProductBottle shape="dropper" tone="cream" brand="The Lab" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[9.5px] font-bold uppercase tracking-wider text-muted">
            {copy.brand}
          </p>
          <p className="mt-0.5 text-[13px] font-semibold leading-tight text-foreground">
            {copy.product}
          </p>
          <p className="mt-1 text-[11px] text-muted">{copy.ingredients}</p>
        </div>
      </div>

      <div
        className="mb-3 flex items-center justify-between gap-3 rounded-2xl border p-3"
        style={{
          borderColor: 'rgba(184, 84, 10, 0.32)',
          background: 'var(--warning-soft)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="inline-grid h-9 w-9 shrink-0 place-items-center rounded-xl"
            style={{
              background: 'rgba(184, 84, 10, 0.18)',
              color: 'var(--warning)',
            }}
          >
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: 'var(--warning)' }}
            >
              {copy.verdictLabel}
            </p>
            <p
              className="mt-0.5 text-[14px] font-bold"
              style={{ color: 'var(--note-warm-fg)' }}
            >
              {copy.verdict}
            </p>
          </div>
        </div>
        <span
          className="rounded-full bg-surface px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted"
          style={{ borderColor: 'rgba(184, 84, 10, 0.32)' }}
        >
          {copy.confidence}
        </span>
      </div>

      <div className="mb-3">
        <Reading label={copy.safetyLabel} pct={64} tone="mid" score="64%" />
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        <span
          className="inline-flex items-center gap-1 rounded-full border bg-surface px-2 py-1 text-[10.5px] font-medium"
          style={{
            borderColor: 'rgba(184, 84, 10, 0.32)',
            color: 'var(--warning)',
          }}
        >
          <AlertTriangle className="h-2.5 w-2.5" aria-hidden="true" />
          {copy.warning}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-1 text-[10.5px] font-medium text-muted">
          <Check className="h-2.5 w-2.5 text-accent" aria-hidden="true" />
          {copy.friendly}
        </span>
      </div>

      <button
        type="button"
        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-accent bg-accent-soft px-3 py-2 text-[12.5px] font-semibold text-accent-strong"
      >
        <Package className="h-3.5 w-3.5" aria-hidden="true" />
        {copy.compare}
      </button>
    </div>
  );
}

function SmartPicksCard({
  copy,
}: {
  copy: LandingFeatureVisualCopy['smartPicks'];
}) {
  return (
    <div className="rounded-[22px] border border-border bg-surface p-6 shadow-soft">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[15px] font-bold text-foreground">
            {copy.title}
          </p>
          <p className="text-[11.5px] text-muted">{copy.subtitle}</p>
        </div>
        <span
          className="inline-grid h-8 w-8 place-items-center rounded-lg text-background"
          style={{
            background: 'linear-gradient(140deg, var(--ai-strong), #6d28d9)',
          }}
        >
          <Wand className="h-4 w-4" aria-hidden="true" />
        </span>
      </header>
      <div className="mb-4 flex items-center gap-2.5 rounded-2xl border border-[color:var(--ai-border)] bg-[color:var(--ai-soft)] p-3.5">
        <span className="inline-grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[color:var(--ai-bg)] text-[color:var(--ai-strong)]">
          <Sun className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-bold text-[color:var(--ai-fg)]">
            {copy.gapTitle}
          </p>
          <p className="mt-0.5 text-[11.5px] text-muted">
            {copy.gapBody}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {copy.picks.map((pick) => (
          <Pick key={pick.name} {...pick} saveLabel={copy.save} />
        ))}
      </div>
    </div>
  );
}

function Pick({
  shape,
  tone,
  brand,
  name,
  tier,
  tierTone,
  meta,
  featured,
  saveLabel,
}: {
  shape: 'pump' | 'dropper' | 'tube' | 'jar';
  tone: 'green' | 'cream' | 'aqua' | 'blush' | 'amber' | 'lavender';
  brand: string;
  name: string;
  tier: string;
  tierTone?: 'mid' | 'luxe';
  meta: string;
  featured?: boolean;
  saveLabel: string;
}) {
  let tierClass = 'bg-surface-muted text-muted';
  if (tierTone === 'mid') tierClass = 'bg-accent-soft text-accent-strong';
  if (tierTone === 'luxe') tierClass = 'bg-secondary-soft text-[#7c3a18]';
  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border p-2.5 ${
        featured
          ? 'border-accent'
          : 'border-border bg-surface'
      }`}
      style={
        featured
          ? { background: 'color-mix(in srgb, var(--surface) 92%, var(--accent-soft))' }
          : undefined
      }
    >
      <div className="h-[42px] w-8 shrink-0">
        <ProductBottle shape={shape} tone={tone} brand={brand} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9.5px] font-bold uppercase tracking-wider text-muted">
          {brand.replace(/'/g, '’')}
        </p>
        <p className="mt-0.5 text-[13px] font-semibold leading-tight text-foreground">
          {name}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
          <span
            className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider ${tierClass}`}
          >
            {tier}
          </span>
          <span>· {meta}</span>
        </p>
      </div>
      <button
        type="button"
        className="inline-flex shrink-0 items-center rounded-full border border-accent bg-surface px-2.5 py-1.5 text-[11.5px] font-semibold text-accent-strong"
      >
        {saveLabel}
      </button>
    </div>
  );
}

function ClimateCard({
  copy,
}: {
  copy: LandingFeatureVisualCopy['climate'];
}) {
  return (
    <div className="rounded-[22px] border border-border bg-surface p-6 shadow-soft">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[15px] font-bold text-foreground">
            {copy.title}
          </p>
          <p className="text-[11.5px] text-muted">{copy.subtitle}</p>
        </div>
        <span
          className="inline-grid h-8 w-8 place-items-center rounded-lg text-background"
          style={{
            background: 'linear-gradient(140deg, var(--note-cool-fg), var(--accent-strong))',
          }}
        >
          <CloudSun className="h-4 w-4" aria-hidden="true" />
        </span>
      </header>
      <div
        className="mb-3 flex flex-col gap-2.5 rounded-2xl border p-4"
        style={{
          background:
            'linear-gradient(135deg, var(--note-cool-bg), var(--accent-soft))',
          borderColor: 'var(--note-cool-border)',
        }}
      >
        <p className="flex items-center gap-2 text-[13px] text-foreground">
          <MapPin
            className="h-3.5 w-3.5"
            aria-hidden="true"
            style={{ color: 'var(--note-cool-fg)' }}
          />
          <strong className="font-bold" style={{ color: 'var(--note-cool-fg)' }}>
            {copy.city}
          </strong>
        </p>
        <p className="flex items-center gap-2 text-[13px] text-foreground">
          <Thermometer
            className="h-3.5 w-3.5"
            aria-hidden="true"
            style={{ color: 'var(--note-cool-fg)' }}
          />
          <span>
            <strong className="font-bold">{copy.temperature}</strong> ·{' '}
            {copy.climate}
          </span>
        </p>
        <p className="flex items-center gap-2 text-[13px] text-foreground">
          <Sun
            className="h-3.5 w-3.5"
            aria-hidden="true"
            style={{ color: 'var(--note-cool-fg)' }}
          />
          {copy.uv}
        </p>
        <p className="flex items-center gap-2 text-[13px] text-foreground">
          <Wind
            className="h-3.5 w-3.5"
            aria-hidden="true"
            style={{ color: 'var(--note-cool-fg)' }}
          />
          {copy.humidity}
        </p>
      </div>
      <div className="flex gap-2.5 rounded-xl bg-surface-muted p-3 text-[12.5px] leading-snug text-muted">
        <Sparkles
          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent"
          aria-hidden="true"
        />
        <span>{copy.note}</span>
      </div>
    </div>
  );
}
