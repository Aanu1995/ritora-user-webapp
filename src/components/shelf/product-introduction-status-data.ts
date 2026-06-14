import {
  CalendarClock,
  CheckCircle2,
  FlaskConical,
  PauseCircle,
  Sparkles,
  TrendingUp,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { ProductIntroductionStatus } from '@/types/shelf';

export type ProductIntroductionStatusTone =
  | 'neutral'
  | 'caution'
  | 'progress'
  | 'danger';

export type ProductIntroductionStatusMeta = {
  icon: LucideIcon;
  tone: ProductIntroductionStatusTone;
  chip: string;
};

export const PRODUCT_INTRODUCTION_STATUS_META: Record<
  ProductIntroductionStatus,
  ProductIntroductionStatusMeta
> = {
  [ProductIntroductionStatus.New]: {
    icon: Sparkles,
    tone: 'neutral',
    chip: 'border-border-strong bg-surface text-foreground',
  },
  [ProductIntroductionStatus.PatchTesting]: {
    icon: FlaskConical,
    tone: 'caution',
    chip: 'border-warning/30 bg-warning-soft text-warning',
  },
  [ProductIntroductionStatus.Week1]: {
    icon: CalendarClock,
    tone: 'progress',
    chip: 'border-accent-strong/30 bg-accent-soft text-accent-strong',
  },
  [ProductIntroductionStatus.BuildingTolerance]: {
    icon: TrendingUp,
    tone: 'progress',
    chip: 'border-accent-strong/30 bg-accent-soft text-accent-strong',
  },
  [ProductIntroductionStatus.Tolerated]: {
    icon: CheckCircle2,
    tone: 'progress',
    chip: 'border-accent-strong/30 bg-accent-soft text-accent-strong',
  },
  [ProductIntroductionStatus.Paused]: {
    icon: PauseCircle,
    tone: 'neutral',
    chip: 'border-border-strong bg-surface-muted text-muted',
  },
  [ProductIntroductionStatus.Failed]: {
    icon: XCircle,
    tone: 'danger',
    chip: 'border-danger/30 bg-danger-soft text-danger',
  },
};

export const PRODUCT_INTRODUCTION_TONE: Record<
  ProductIntroductionStatusTone,
  { tile: string; hero: string; label: string }
> = {
  neutral: {
    tile: 'bg-surface-muted text-muted',
    hero: 'border-border bg-surface-muted/40',
    label: 'text-foreground',
  },
  caution: {
    tile: 'bg-warning-soft text-warning',
    hero: 'border-warning/25 bg-warning-soft/40',
    label: 'text-warning',
  },
  progress: {
    tile: 'bg-accent-soft text-accent-strong',
    hero: 'border-accent-strong/25 bg-accent-soft/40',
    label: 'text-accent-strong',
  },
  danger: {
    tile: 'bg-danger-soft text-danger',
    hero: 'border-danger/25 bg-danger-soft/40',
    label: 'text-danger',
  },
};

export const PRODUCT_INTRODUCTION_JOURNEY: ProductIntroductionStatus[] = [
  ProductIntroductionStatus.Week1,
  ProductIntroductionStatus.BuildingTolerance,
  ProductIntroductionStatus.Tolerated,
];

export const PRODUCT_INTRODUCTION_START_OPTIONS: ProductIntroductionStatus[] = [
  ProductIntroductionStatus.Week1,
  ProductIntroductionStatus.BuildingTolerance,
  ProductIntroductionStatus.Tolerated,
  ProductIntroductionStatus.Paused,
  ProductIntroductionStatus.Failed,
];

export const PRODUCT_INTRODUCTION_OFF_RAMP: ProductIntroductionStatus[] = [
  ProductIntroductionStatus.Paused,
  ProductIntroductionStatus.Failed,
];

export const PRODUCT_INTRODUCTION_INFO_STATUSES: ProductIntroductionStatus[] = [
  ...PRODUCT_INTRODUCTION_START_OPTIONS,
];
