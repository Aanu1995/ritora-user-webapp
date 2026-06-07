import type { HTMLAttributes, ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  Award,
  BadgeCheck,
  Check,
  Circle,
  Gift,
  Link2,
  Megaphone,
  Package,
  Stethoscope,
  TrendingDown,
  TrendingUp,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  CommunityDisclosureType,
  CommunitySafetySeverity,
} from "@/types/community";
import { humaniseCommunityTag } from "./community-i18n-options";

export type BadgeTone = "muted" | "accent" | "warning" | "danger" | "ai";

const disclosureMeta: Record<
  CommunityDisclosureType,
  { Icon: LucideIcon; fallbackLabel: string; tone: BadgeTone }
> = {
  ordinary: { Icon: User, fallbackLabel: "Ordinary user", tone: "muted" },
  gifted: { Icon: Gift, fallbackLabel: "Gifted", tone: "warning" },
  sponsored: { Icon: Megaphone, fallbackLabel: "Sponsored", tone: "danger" },
  affiliate: { Icon: Link2, fallbackLabel: "Affiliate", tone: "warning" },
  professional: {
    Icon: Stethoscope,
    fallbackLabel: "Professional",
    tone: "accent",
  },
  brand_rep: { Icon: BadgeCheck, fallbackLabel: "Brand rep", tone: "ai" },
};

const toneClasses: Record<BadgeTone, string> = {
  muted: "bg-surface-muted text-muted border-border",
  accent: "bg-accent-soft text-accent-strong border-accent/30",
  warning: "bg-warning-soft text-warning border-warning/30",
  danger: "bg-danger-soft text-danger border-danger/30",
  ai: "bg-ai-bg text-ai-fg border-ai-border",
};

const outcomeMeta: Record<string, { Icon: LucideIcon; tone: BadgeTone }> = {
  "helped-overall": { Icon: TrendingUp, tone: "accent" },
  helped: { Icon: TrendingUp, tone: "accent" },
  worsened: { Icon: TrendingDown, tone: "danger" },
  "no-change": { Icon: Circle, tone: "muted" },
  irritation: { Icon: TrendingDown, tone: "warning" },
  "barrier-recovery": { Icon: Check, tone: "accent" },
  repurchased: { Icon: Award, tone: "ai" },
  "stopped-using": { Icon: X, tone: "muted" },
};

export function DisclosureBadge({ value }: { value: CommunityDisclosureType }) {
  const t = useTranslations("community.shared.disclosureBadge");
  const meta = disclosureMeta[value] ?? disclosureMeta.ordinary;
  return (
    <Badge tone={meta.tone}>
      <meta.Icon className="h-3 w-3" />
      {t(value)}
    </Badge>
  );
}

export function disclosureLabel(value: CommunityDisclosureType): string {
  return disclosureMeta[value]?.fallbackLabel ?? value;
}

export function Badge({
  children,
  tone = "muted",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function MatchBadge({ score }: { score: number }) {
  const t = useTranslations("community.shared");
  const tone: BadgeTone = score >= 85 ? "accent" : "muted";
  return (
    <Badge tone={tone}>
      <Award className="h-3 w-3" />
      {t("matchBadge", { score })}
    </Badge>
  );
}

type ChipProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
};

export function Chip({ children, className, ...rest }: ChipProps) {
  /* Spreads any extra HTML attributes (e.g. `title` for
     hover-discovery on truncated chips) onto the underlying
     span. Callers that need to mark a chip as truncating its
     own content can pass `className="max-w-full truncate"
     title={fullString}` without us needing a dedicated prop
     for every standard HTML attribute. */
  return (
    <span
      {...rest}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SafetyChip({
  children,
  severity,
}: {
  children: ReactNode;
  severity: CommunitySafetySeverity;
}) {
  return (
    <Badge tone={severity === "high" ? "danger" : "warning"}>{children}</Badge>
  );
}

export function OutcomeChip({ value }: { value: string }) {
  const t = useTranslations("community.shared.outcomes");
  const meta = outcomeMeta[value] ?? {
    Icon: Circle,
    tone: "muted" as BadgeTone,
  };
  const label = value in outcomeMeta ? t(value) : humaniseCommunityTag(value);
  return (
    <Badge tone={meta.tone}>
      <meta.Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

export function EmptyState({
  body,
  title,
  icon: Icon = Package,
  action,
}: {
  body: string;
  title: string;
  icon?: LucideIcon;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border-strong bg-surface p-10 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent-strong">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-muted">
        {body}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
