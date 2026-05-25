import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { AppRoute } from '@/constants/app-routes';
import { getSupportEmail } from '@/lib/support-email';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('legalPages.terms');

  return {
    title: t('metadataTitle'),
    description: t('metadataDescription'),
    alternates: { canonical: AppRoute.Terms },
  };
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-[24px] leading-tight font-bold tracking-tight text-foreground sm:text-[28px]">
        {title}
      </h2>
      <div className="mt-5 space-y-5 text-[15.5px] leading-[1.78] text-foreground/90">
        {children}
      </div>
    </section>
  );
}

function Bullets({ children }: { children: ReactNode }) {
  return (
    <ul className="list-disc space-y-2 pl-5 marker:text-muted/60">
      {children}
    </ul>
  );
}

function createRichTags(supportEmail: string) {
  return {
    strong: (chunks: ReactNode) => (
      <strong className="font-semibold text-foreground">{chunks}</strong>
    ),
    em: (chunks: ReactNode) => <em>{chunks}</em>,
    support: (chunks: ReactNode) => (
      <a
        href={`mailto:${supportEmail}`}
        className="text-accent-strong underline decoration-accent/40 underline-offset-[3px] transition-colors hover:decoration-current"
      >
        {chunks}
      </a>
    ),
    supportEmail,
  };
}

export default async function TermsPage() {
  const t = await getTranslations('legalPages.terms');
  const richTags = createRichTags(getSupportEmail());
  const stringBullets = (key: string) =>
    (t.raw(key) as string[]).map((bullet, idx) => (
      <li key={`${key}-${idx}`}>{bullet}</li>
    ));

  return (
    <div className="relative min-h-screen overflow-hidden">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[720px] px-5 pt-10 pb-24 sm:px-6 sm:pt-14 lg:pt-16 lg:pb-32">
        <h1 className="font-display text-[32px] font-bold tracking-tight text-foreground sm:text-[38px]">
          {t('title')}
        </h1>
        <p className="mt-3 text-sm text-muted">{t('lastUpdated')}</p>

        <article className="mt-10 space-y-12">
          <Section title={t('overview.title')}>
            <p>{t('overview.p1')}</p>
          </Section>

          <Section title={t('eligibility.title')}>
            <p>{t('eligibility.p1')}</p>
          </Section>

          <Section title={t('account.title')}>
            <p>{t.rich('account.p1', richTags)}</p>
          </Section>

          <Section title={t('ritoraIs.title')}>
            <p>{t('ritoraIs.p1')}</p>
            <p>{t('ritoraIs.p2')}</p>
          </Section>

          <Section title={t('yourContent.title')}>
            <p>{t('yourContent.p1')}</p>
            <p>{t('yourContent.p2')}</p>
          </Section>

          <Section title={t('prohibited.title')}>
            <p>{t('prohibited.lead')}</p>
            <Bullets>{stringBullets('prohibited.bullets')}</Bullets>
            <p>{t('prohibited.tail')}</p>
          </Section>

          <Section title={t('pricing.title')}>
            <p>{t('pricing.p1')}</p>
          </Section>

          <Section title={t('suspension.title')}>
            <p>{t('suspension.p1')}</p>
            <p>{t('suspension.p2')}</p>
          </Section>

          <Section title={t('warranty.title')}>
            <p>{t('warranty.p1')}</p>
          </Section>

          <Section title={t('liability.title')}>
            <p>{t('liability.p1')}</p>
            <p>{t('liability.p2')}</p>
          </Section>

          <Section title={t('changes.title')}>
            <p>{t('changes.p1')}</p>
          </Section>

          <Section title={t('contact.title')}>
            <p>{t.rich('contact.p1', richTags)}</p>
          </Section>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
