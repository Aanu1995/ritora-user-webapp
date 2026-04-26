import { useTranslations } from 'next-intl';
import { AnalysisSeverity } from '@/types/ingredients';

const TONE_CLASSES: Record<AnalysisSeverity, string> = {
  [AnalysisSeverity.High]: 'bg-danger/10 text-danger border-danger/30',
  [AnalysisSeverity.Medium]: 'bg-warning/10 text-warning border-warning/30',
  [AnalysisSeverity.Low]: 'bg-surface-muted text-muted border-border',
};

type Props = {
  severity: AnalysisSeverity;
};

export function SeverityBadge({ severity }: Props) {
  const t = useTranslations('ingredients.severity');
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${TONE_CLASSES[severity]}`}
    >
      {t(severity)}
    </span>
  );
}
