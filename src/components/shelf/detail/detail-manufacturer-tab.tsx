'use client';

import { ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { flagEmoji, getCountry } from '@/constants/countries';
import { isSafeExternalUrl } from '@/lib/shelf-form';
import {
  DataProvenance,
  type ManufacturerInfo,
} from '@/types/shelf';

type Props = {
  manufacturer: ManufacturerInfo;
  provenance: DataProvenance;
  confirmedAt: string | null;
};

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function DetailManufacturerTab({
  manufacturer,
  provenance,
  confirmedAt,
}: Props) {
  const t = useTranslations('shelf.detail.manufacturer');
  const tProvenance = useTranslations('shelf.provenance');

  const hasAnyField =
    manufacturer.brand ||
    manufacturer.parentCompany ||
    manufacturer.countryOfManufacture ||
    manufacturer.countryOfOrigin ||
    manufacturer.supportEmail ||
    manufacturer.productUrl;

  if (!hasAnyField) {
    return <p className="text-sm text-muted">{t('empty')}</p>;
  }

  const made =
    manufacturer.countryOfManufacture ?? manufacturer.countryOfOrigin;
  const productUrl =
    manufacturer.productUrl && isSafeExternalUrl(manufacturer.productUrl)
      ? manufacturer.productUrl
      : null;
  const confirmedDate = confirmedAt
    ? new Date(confirmedAt).toLocaleDateString()
    : null;

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-display text-lg font-semibold">{t('heading')}</h3>

      <div className="grid gap-2 sm:grid-cols-2">
        <Row label={t('brand')} value={manufacturer.brand} />
        {manufacturer.parentCompany ? (
          <Row label={t('parent')} value={manufacturer.parentCompany} />
        ) : null}
        {made ? (
          <Row
            label={t('madeIn')}
            value={
              getCountry(made)
                ? `${flagEmoji(made)} ${getCountry(made)!.name}`.trim()
                : `${flagEmoji(made)} ${made}`.trim()
            }
          />
        ) : null}
        {manufacturer.supportEmail ? (
          <Row label={t('support')} value={manufacturer.supportEmail} />
        ) : null}
      </div>

      {productUrl ? (
        <a
          href={productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 self-start rounded-full border border-accent-strong px-3.5 py-2 text-sm font-semibold text-accent-strong hover:bg-accent-soft"
        >
          {t('productLink', { domain: domainOf(productUrl) })}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      ) : null}

      {confirmedDate ? (
        <p className="text-xs text-muted">
          {t('source', {
            source: tProvenance(provenance),
            date: confirmedDate,
          })}
        </p>
      ) : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <dl className="rounded-xl bg-surface-muted px-3 py-2.5">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
        {label}
      </dt>
      <dd className="mt-0.5 text-[15px] font-semibold">{value}</dd>
    </dl>
  );
}
