'use client';

import { useTranslations } from 'next-intl';
import {
  NAV_ITEMS,
  NavGroup,
  NavItemStatus,
} from '@/constants/nav-config';

/**
 * Shows the "coming soon" Main-group features on the Dashboard so the home
 * surface always signals what Ritora is building toward next, even when the
 * only live widget is the routine check.
 */
export function UpcomingFeatures() {
  const t = useTranslations('dashboard');
  const tComingSoon = useTranslations('comingSoon');
  const eyebrow = tComingSoon('eyebrow');

  const items = NAV_ITEMS.filter(
    (item) =>
      item.group === NavGroup.Main && item.status === NavItemStatus.Planned,
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      aria-label={t('upcomingHeading')}
      data-testid="upcoming-features"
      className="flex flex-col gap-3"
    >
      <h2 className="text-[11px] font-semibold uppercase tracking-wide text-muted">
        {t('upcomingHeading')}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.route}
              className="flex flex-col gap-2 rounded-2xl border border-dashed border-border-strong bg-surface/50 p-4"
            >
              <div className="flex items-center gap-2 text-muted">
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="text-[10px] font-semibold uppercase tracking-wide">
                  {eyebrow}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                {tComingSoon(`${item.labelKey}.title`)}
              </h3>
              <p className="text-xs leading-relaxed text-muted">
                {tComingSoon(`${item.labelKey}.description`)}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
