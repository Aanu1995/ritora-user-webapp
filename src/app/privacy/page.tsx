import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { AppRoute } from '@/constants/app-routes';
import { getSupportEmail } from '@/lib/support-email';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('legalPages.privacy');

  return {
    title: t('metadataTitle'),
    description: t('metadataDescription'),
    alternates: { canonical: AppRoute.Privacy },
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

export default async function PrivacyPage() {
  const t = await getTranslations('legalPages.privacy');
  const richTags = createRichTags(getSupportEmail());
  const stringBullets = (key: string) =>
    (t.raw(key) as string[]).map((bullet, idx) => (
      <li key={`${key}-${idx}`}>{bullet}</li>
    ));

  return (
    <div className="relative min-h-screen overflow-hidden">
      <SiteHeader showNavLinks={false} />
      <main className="mx-auto w-full max-w-[720px] px-5 pt-10 pb-24 sm:px-6 sm:pt-14 lg:pt-16 lg:pb-32">
        <h1 className="font-display text-[32px] font-bold tracking-tight text-foreground sm:text-[38px]">
          {t('title')}
        </h1>
        <p className="mt-3 text-sm text-muted">{t('lastUpdated')}</p>

        <article className="mt-10 space-y-12">
          <Section title={t('overview.title')}>
            <p>{t('overview.lead')}</p>
            <p>{t('overview.intro')}</p>
            <Bullets>{stringBullets('overview.bullets')}</Bullets>
            <p>{t.rich('overview.tail', richTags)}</p>
          </Section>

          <Section title={t('whatWeCollect.title')}>
            <p>{t('whatWeCollect.lead')}</p>
            <p>{t.rich('whatWeCollect.accountInfo', richTags)}</p>
            <p>{t.rich('whatWeCollect.skinProfile', richTags)}</p>
            <p>{t.rich('whatWeCollect.photosAndRoutine', richTags)}</p>
            <p>{t.rich('whatWeCollect.basicTech', richTags)}</p>
            <p>{t('whatWeCollect.tail')}</p>
          </Section>

          <Section title={t('howWeUse.title')}>
            <p>{t('howWeUse.lead')}</p>
            <Bullets>{stringBullets('howWeUse.bullets')}</Bullets>
            <p>{t('howWeUse.tail')}</p>
          </Section>

          <Section title={t('photosAndAi.title')}>
            <p>{t('photosAndAi.lead')}</p>
            <Bullets>
              {stringBullets('photosAndAi.bullets')}
              <li>{t.rich('photosAndAi.bulletStrong', richTags)}</li>
            </Bullets>
            <p>{t('photosAndAi.disclaimer')}</p>
          </Section>

          <Section title={t('sharing.title')}>
            <p>{t('sharing.p1')}</p>
            <p>{t('sharing.p2')}</p>
          </Section>

          <Section title={t('retention.title')}>
            <p>{t('retention.p1')}</p>
            <p>{t('retention.p2')}</p>
          </Section>

          <Section title={t('location.title')}>
            <p>{t('location.p1')}</p>
          </Section>

          <Section title={t('security.title')}>
            <p>{t('security.p1')}</p>
            <p>{t('security.p2')}</p>
            <p>{t.rich('security.p3', richTags)}</p>
          </Section>

          <Section title={t('rights.title')}>
            <p>{t.rich('rights.lead', richTags)}</p>
            <Bullets>{stringBullets('rights.bullets')}</Bullets>
            <p>{t.rich('rights.p1', richTags)}</p>
            <p>{t('rights.p2')}</p>
          </Section>

          <Section title={t('children.title')}>
            <p>{t.rich('children.p1', richTags)}</p>
          </Section>

          <Section title={t('cookies.title')}>
            <p>{t('cookies.lead')}</p>
            <Bullets>{stringBullets('cookies.bullets')}</Bullets>
            <p>{t('cookies.tail')}</p>
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
