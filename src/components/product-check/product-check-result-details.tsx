'use client';

import {
  AlertTriangle,
  ArrowRight,
  CircleDollarSign,
  FlaskConical,
  ShoppingBag,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { ActivesList } from '@/components/ingredients/actives-list';
import { ConflictCard } from '@/components/ingredients/conflict-card';
import { OverlapCard } from '@/components/ingredients/overlap-card';
import { Button } from '@/components/ui/button';
import {
  ProductCheckPersonalizationLevel,
  ProductCheckNextAction,
  ProductCheckVerdict,
  type ProductCheckAlternative,
  type ProductCheckContextSummary,
  type ProductCheckPurchaseGuidance,
  type ProductCheckReactionEvidence,
  type ProductCheckResponse,
} from '@/types/ingredients';

const FINDING_LIMIT = 3;

type Props = {
  result: ProductCheckResponse;
};

export function ProductCheckResultDetails({ result }: Props) {
  const t = useTranslations('checkProduct.details');
  const conflicts = result.analysis.conflicts.slice(0, FINDING_LIMIT);
  const overlaps = result.analysis.overlaps.slice(0, FINDING_LIMIT);
  const reactionEvidence = result.reactionEvidence.slice(0, FINDING_LIMIT);
  const showSmartPicks =
    result.verdict.nextAction === ProductCheckNextAction.ReviewSmartPicks ||
    result.verdict.label === ProductCheckVerdict.AvoidForProfile ||
    overlaps.length > 0 ||
    result.purchaseGuidance.shouldConsiderAlternatives;

  return (
    <div className="flex flex-col gap-4">
      <ProductCheckContextNotice context={result.context} />
      <ActivesList actives={result.analysis.actives} />

      {reactionEvidence.length > 0 ? (
        <ReactionEvidenceSection evidence={reactionEvidence} />
      ) : null}

      {conflicts.length > 0 ? (
        <section className="flex flex-col gap-2">
          <SectionHeader
            icon={<FlaskConical className="h-4 w-4" aria-hidden />}
            title={t('findingsHeading')}
            body={t('findingsBody')}
          />
          <div className="flex flex-col gap-2">
            {conflicts.map((conflict, index) => (
              <ConflictCard
                key={`${conflict.code}:${conflict.productAId}:${conflict.productBId}:${conflict.ingredientA}:${conflict.ingredientB}:${index}`}
                conflict={conflict}
              />
            ))}
          </div>
        </section>
      ) : null}

      {overlaps.length > 0 ? (
        <section className="flex flex-col gap-2">
          <SectionHeader
            icon={<CircleDollarSign className="h-4 w-4" aria-hidden />}
            title={t('routineHeading')}
            body={t('routineBody')}
          />
          <div className="flex flex-col gap-2">
            {overlaps.map((overlap, index) => (
              <OverlapCard
                key={`${overlap.ingredient}:${overlap.productIds.join(',')}:${index}`}
                overlap={overlap}
              />
            ))}
          </div>
        </section>
      ) : null}

      {showSmartPicks ? (
        <SmartPicksGuidance guidance={result.purchaseGuidance} />
      ) : null}
    </div>
  );
}

function ProductCheckContextNotice({
  context,
}: {
  context: ProductCheckContextSummary;
}) {
  const t = useTranslations('checkProduct.details.context');
  const isEducational =
    context.level === ProductCheckPersonalizationLevel.Educational;
  const signalKeys = context.usedSignals.length
    ? context.usedSignals
    : context.missingSignals.slice(0, 3);

  return (
    <section className="rounded-2xl border border-border bg-surface-muted p-4">
      <h3 className="text-sm font-semibold text-foreground">
        {isEducational ? t('educationalTitle') : t('personalizedTitle')}
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        {isEducational ? t('educationalBody') : t('personalizedBody')}
      </p>
      {signalKeys.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {signalKeys.map((signal) => (
            <span
              key={signal}
              className="inline-flex items-center rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-foreground"
            >
              {t(`signals.${signal}`)}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ReactionEvidenceSection({
  evidence,
}: {
  evidence: ProductCheckReactionEvidence[];
}) {
  const t = useTranslations('checkProduct.details');

  return (
    <section className="flex flex-col gap-2">
      <SectionHeader
        icon={<AlertTriangle className="h-4 w-4" aria-hidden />}
        title={t('reactionHeading')}
        body={t('reactionBody')}
      />
      <div className="flex flex-col gap-2">
        {evidence.map((item) => (
          <article
            key={`${item.kind}:${item.productName ?? item.ingredientNames.join(',')}`}
            className="rounded-2xl border border-border bg-surface p-3"
          >
            <p className="text-sm font-semibold text-foreground">
              {t(`evidence.${item.kind}`)}
            </p>
            {item.productName ? (
              <p className="mt-1 text-xs text-muted">{item.productName}</p>
            ) : null}
            {item.reactionSignalCount > 0 && item.usageDaysLast90 ? (
              <p className="mt-1 text-xs text-muted">
                {t('reactionStats', {
                  reactions: item.reactionSignalCount,
                  usageDays: item.usageDaysLast90,
                })}
              </p>
            ) : null}
            {item.ingredientNames.length > 0 ? (
              <p className="mt-1 text-xs text-muted">
                {t('evidenceIngredients', {
                  ingredients: item.ingredientNames.join(', '),
                })}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function SmartPicksGuidance({
  guidance,
}: {
  guidance: ProductCheckPurchaseGuidance;
}) {
  const t = useTranslations('checkProduct.details');
  const alternatives = guidance.alternatives.slice(0, FINDING_LIMIT);

  return (
    <section className="rounded-2xl border border-border bg-surface-muted p-4">
      <div className="flex items-center gap-2 text-accent-strong">
        <ShoppingBag className="h-4 w-4" aria-hidden />
        <h3 className="text-sm font-semibold text-foreground">
          {t('smartPicksTitle')}
        </h3>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        {t('smartPicksBody')}
      </p>

      {alternatives.length > 0 ? (
        <div className="mt-3 flex flex-col gap-2">
          {alternatives.map((alternative) => (
            <SmartPickAlternative
              key={alternative.id}
              alternative={alternative}
            />
          ))}
        </div>
      ) : null}

      <Button asChild size="sm" variant="secondary" className="mt-3">
        <Link href="/smart-picks">
          {t('smartPicksCta')}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </Button>
    </section>
  );
}

function SmartPickAlternative({
  alternative,
}: {
  alternative: ProductCheckAlternative;
}) {
  const t = useTranslations('checkProduct.details');

  return (
    <article className="rounded-xl border border-border bg-surface p-3">
      <p className="text-sm font-semibold text-foreground">
        {alternative.brand}
      </p>
      <p className="text-sm text-foreground">{alternative.productName}</p>
      <p className="mt-1 text-xs text-muted">
        {t('alternativeCategory', {
          category: alternative.ingredientOrCategory,
        })}
      </p>
      {alternative.reason ? (
        <p className="mt-1 text-xs text-muted">{alternative.reason}</p>
      ) : null}
      {alternative.sellerNames.length > 0 ? (
        <p className="mt-1 text-xs text-muted">
          {t('alternativeSellers', {
            sellers: alternative.sellerNames.join(', '),
          })}
        </p>
      ) : null}
    </article>
  );
}

type SectionHeaderProps = {
  icon: ReactNode;
  title: string;
  body: string;
};

function SectionHeader({ icon, title, body }: SectionHeaderProps) {
  return (
    <header>
      <div className="flex items-center gap-2 text-accent-strong">
        {icon}
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted">{body}</p>
    </header>
  );
}
