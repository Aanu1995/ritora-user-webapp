import type { ReactNode } from "react";
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
} from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type {
  CommunityDisclosureType,
  CommunityPostingEligibility,
  CommunitySafetySeverity,
} from "@/types/community";
import { disclosureOptions } from "./community-constants";

export type CommunityTab =
  | "for-you"
  | "people"
  | "routines"
  | "reviews"
  | "publish"
  | "submissions"
  | "trust";

/* ===========================================================
 * Disclosure badge — typed icon + colour per disclosure kind.
 * Sponsored/affiliate ride the warning palette because Ritora
 * downweights them; ordinary is the neutral default.
 * ========================================================= */

const disclosureMeta: Record<
  CommunityDisclosureType,
  { Icon: typeof Megaphone; label: string; tone: BadgeTone }
> = {
  ordinary: { Icon: User, label: "Ordinary user", tone: "muted" },
  gifted: { Icon: Gift, label: "Gifted", tone: "warning" },
  sponsored: { Icon: Megaphone, label: "Sponsored", tone: "danger" },
  affiliate: { Icon: Link2, label: "Affiliate", tone: "warning" },
  professional: { Icon: Stethoscope, label: "Professional", tone: "accent" },
  brand_rep: { Icon: BadgeCheck, label: "Brand rep", tone: "ai" },
};

export function DisclosureBadge({ value }: { value: CommunityDisclosureType }) {
  const meta = disclosureMeta[value] ?? disclosureMeta.ordinary;
  return (
    <Badge tone={meta.tone}>
      <meta.Icon className="h-3 w-3" />
      {meta.label}
    </Badge>
  );
}

export function disclosureLabel(value: CommunityDisclosureType): string {
  return disclosureMeta[value]?.label ?? value;
}

/* ===========================================================
 * Generic tone-aware badge. Used by disclosure, match score
 * and any one-off labels the community surface needs.
 * ========================================================= */

type BadgeTone = "muted" | "accent" | "warning" | "danger" | "ai";

const toneClasses: Record<BadgeTone, string> = {
  muted: "bg-surface-muted text-muted border-border",
  accent: "bg-accent-soft text-accent-strong border-accent/30",
  warning: "bg-warning-soft text-warning border-warning/30",
  danger: "bg-danger-soft text-danger border-danger/30",
  ai: "bg-ai-bg text-ai-fg border-ai-border",
};

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
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function MatchBadge({ score }: { score: number }) {
  const tone: BadgeTone =
    score >= 85 ? "accent" : score >= 65 ? "muted" : "muted";
  return (
    <Badge tone={tone}>
      <Award className="h-3 w-3" />
      {score}% match
    </Badge>
  );
}

/* ===========================================================
 * Chips — for relevance reasons and small inline metadata.
 * ========================================================= */

export function Chip({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ===========================================================
 * Safety chip — high severity uses danger palette; low/medium
 * use warning. Avoids raw red/amber Tailwind colours so dark
 * mode works without ad-hoc overrides.
 * ========================================================= */

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

/* ===========================================================
 * Outcome chips — surfaces concrete outcomes (helped, worsened,
 * repurchased…) using semantic colour rather than rating stars.
 * Falls back to neutral for unknown outcome strings.
 * ========================================================= */

const outcomeMeta: Record<
  string,
  { Icon: typeof Check; tone: BadgeTone; label: string }
> = {
  "helped-overall": { Icon: TrendingUp, tone: "accent", label: "Helped" },
  helped: { Icon: TrendingUp, tone: "accent", label: "Helped" },
  worsened: { Icon: TrendingDown, tone: "danger", label: "Worsened" },
  "no-change": { Icon: Circle, tone: "muted", label: "No change" },
  irritation: {
    Icon: TrendingDown,
    tone: "warning",
    label: "Caused irritation",
  },
  "barrier-recovery": {
    Icon: Check,
    tone: "accent",
    label: "Barrier recovery",
  },
  repurchased: { Icon: Award, tone: "ai", label: "Repurchased" },
  "stopped-using": { Icon: X, tone: "muted", label: "Stopped using" },
};

export function OutcomeChip({ value }: { value: string }) {
  const meta = outcomeMeta[value] ?? {
    Icon: Circle,
    tone: "muted" as BadgeTone,
    label: humaniseTag(value),
  };
  return (
    <Badge tone={meta.tone}>
      <meta.Icon className="h-3 w-3" />
      {meta.label}
    </Badge>
  );
}

function humaniseTag(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ===========================================================
 * Empty state — used across publish, submissions, lists.
 * ========================================================= */

export function EmptyState({
  body,
  title,
  icon: Icon = Package,
  action,
}: {
  body: string;
  title: string;
  icon?: typeof Package;
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

/* ===========================================================
 * Form primitives — Field, FormGrid, hint, error.
 * ========================================================= */

export function Field({
  children,
  hint,
  label,
  required,
}: {
  children: ReactNode;
  hint?: string;
  label: string;
  required?: boolean;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
        {required ? (
          <span className="rounded-full bg-danger-soft px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-danger">
            Required
          </span>
        ) : null}
      </Label>
      {hint ? <p className="text-xs leading-5 text-muted">{hint}</p> : null}
      {children}
    </div>
  );
}

export function FormGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

export function FormSection({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <section className="grid gap-4">
      <div>
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-muted">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function CommunityFieldError({
  errors,
}: {
  errors: readonly unknown[];
}) {
  const message = readFirstFieldError(errors);
  return message ? (
    <span className="text-xs font-medium text-danger" role="alert">
      {message}
    </span>
  ) : null;
}

/* ===========================================================
 * Re-exported textarea so community forms get a single import.
 * The underlying primitive lives in ui/.
 * ========================================================= */

export { Textarea as CommunityTextarea } from "@/components/ui/textarea";

export function CommunityTextareaField({
  field,
  hint,
  label,
  placeholder,
  required,
  maxLength,
}: {
  field: {
    handleBlur: () => void;
    handleChange: (value: string) => void;
    name: string;
    state: {
      meta: { errors: readonly unknown[] };
      value: string;
    };
  };
  hint?: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
}) {
  const value = field.state.value ?? "";
  const invalid = field.state.meta.errors.length > 0;
  return (
    <Field hint={hint} label={label} required={required}>
      <Textarea
        name={field.name}
        value={value}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={invalid}
        className={cn(invalid && "border-danger focus-visible:ring-danger/30")}
      />
      <div className="flex items-center justify-between">
        <CommunityFieldError errors={field.state.meta.errors} />
        {maxLength ? (
          <span className="ml-auto text-[11px] tabular-nums text-muted">
            {value.length}/{maxLength}
          </span>
        ) : null}
      </div>
    </Field>
  );
}

/* ===========================================================
 * Disclosure picker — now a real Radix Select to match the rest
 * of the app. Keeps the same field signature so callers don't
 * have to change.
 * ========================================================= */

export function CommunityDisclosureSelect({
  field,
}: {
  field: {
    handleBlur: () => void;
    handleChange: (value: CommunityDisclosureType) => void;
    name: string;
    state: {
      meta: { errors: readonly unknown[] };
      value: CommunityDisclosureType;
    };
  };
}) {
  const invalid = field.state.meta.errors.length > 0;
  return (
    <Field
      hint="Sponsored, gifted and affiliate reviews are labelled wherever they appear."
      label="Disclosure"
      required
    >
      <Select
        name={field.name}
        value={field.state.value}
        onValueChange={(value) =>
          field.handleChange(value as CommunityDisclosureType)
        }
      >
        <SelectTrigger
          aria-invalid={invalid}
          onBlur={field.handleBlur}
          className={cn(
            invalid && "border-danger focus-visible:ring-danger/30",
          )}
        >
          <SelectValue placeholder="Pick a disclosure" />
        </SelectTrigger>
        <SelectContent>
          {disclosureOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <CommunityFieldError errors={field.state.meta.errors} />
    </Field>
  );
}

function readFirstFieldError(errors: readonly unknown[]) {
  const issue = errors.find(Boolean);
  if (typeof issue === "string") return issue;
  if (issue instanceof Error) return issue.message;
  if (typeof issue === "object" && issue !== null && "message" in issue) {
    const message = (issue as { message?: unknown }).message;
    return typeof message === "string" ? message : undefined;
  }
  return undefined;
}

/* ===========================================================
 * Skeletons — real `Skeleton` primitive, structured to mirror
 * the actual content so the page doesn't visibly reflow when
 * data arrives.
 * ========================================================= */

export function CommunitySkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <div className="space-y-3">
        <Skeleton className="h-7 w-48 rounded-lg" />
        <Skeleton className="h-4 w-72 rounded-md" />
      </div>
      <Skeleton className="h-40 rounded-2xl" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-9 w-24 rounded-lg"
          />
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-56 rounded-md" />
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
      </div>
    </div>
  );
}

export function CommunityCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/5 rounded-md" />
          <Skeleton className="h-3 w-2/5 rounded-md" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-3 w-full rounded-md" />
      <Skeleton className="mt-2 h-3 w-4/5 rounded-md" />
    </div>
  );
}

export function CommunityListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <CommunityCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function CommunityDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-7 w-72 rounded-lg" />
          <Skeleton className="h-4 w-56 rounded-md" />
        </div>
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
      <Skeleton className="h-48 rounded-2xl" />
      <div className="grid gap-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    </div>
  );
}

/* ===========================================================
 * Inline spinner — wraps the icon convention already used in
 * community buttons so consumers don't repeat it.
 * ========================================================= */

export function InlineSpinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent",
        className,
      )}
    />
  );
}

export function formatEligibilityDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatEligibilityReasonTitle(
  code: CommunityPostingEligibility["reasons"][number]["code"],
) {
  switch (code) {
    case "email_unverified":
      return "Email verification required";
    case "skin_profile_required":
      return "Skin profile required";
    case "shelf_product_required":
      return "Shelf product required";
    case "community_guidelines_required":
      return "Community rules required";
    case "account_too_new":
      return "Account age requirement";
    case "recent_moderation_abuse":
      return "Posting temporarily paused";
    default:
      return "Posting requirement";
  }
}
