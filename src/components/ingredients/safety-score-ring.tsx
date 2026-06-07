import { useTranslations } from 'next-intl';

const SIZE = 80;
const STROKE = 8;

type Tone = 'excellent' | 'good' | 'needs_review' | 'risky';

function resolveTone(score: number): Tone {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'needs_review';
  return 'risky';
}

const TONE_CLASS: Record<Tone, string> = {
  excellent: 'text-success',
  good: 'text-success',
  needs_review: 'text-warning',
  risky: 'text-danger',
};

type Props = {
  score: number;
  size?: number;
  showLabel?: boolean;
};

export function SafetyScoreRing({
  score,
  size = SIZE,
  showLabel = true,
}: Props) {
  const t = useTranslations('ingredients.scoreLabel');
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const tone = resolveTone(clamped);
  const strokeRatio = STROKE / SIZE;
  const stroke = strokeRatio * size;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const label = t(tone);

  const ring = (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`${clamped} of 100. ${label}.`}
      className={TONE_CLASS[tone]}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.15}
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        dy="0.35em"
        textAnchor="middle"
        className="fill-current font-semibold"
        style={{ fontSize: size * 0.3 }}
      >
        {clamped}
      </text>
    </svg>
  );

  if (!showLabel) {
    return ring;
  }

  return (
    <div className="flex items-center gap-3">
      {ring}
      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-wide text-muted">
          {t('title')}
        </span>
        <span className={`text-sm font-semibold ${TONE_CLASS[tone]}`}>
          {label}
        </span>
      </div>
    </div>
  );
}
