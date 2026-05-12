import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import {
  CheckCircle2,
  CircleDashed,
  Droplets,
  Eye,
  Layers,
  Leaf,
  Plus,
  Sparkles,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  SmartPicksCoverageRole,
  SmartPicksCoverageSlot,
  SmartPicksOverview,
} from "@/types/smart-picks";

interface CoverageMeterProps {
  coverage: SmartPicksOverview["coverage"];
}

const ROLE_ICON: Record<SmartPicksCoverageRole, ReactNode> = {
  cleanse: <Droplets className="h-4 w-4" aria-hidden="true" />,
  hydrate: <Sparkles className="h-4 w-4" aria-hidden="true" />,
  treat: <Sparkles className="h-4 w-4" aria-hidden="true" />,
  moisturise: <Leaf className="h-4 w-4" aria-hidden="true" />,
  spf: <Sun className="h-4 w-4" aria-hidden="true" />,
  eye: <Eye className="h-4 w-4" aria-hidden="true" />,
  "treatment-secondary": <Layers className="h-4 w-4" aria-hidden="true" />,
};

export function CoverageMeter({ coverage }: CoverageMeterProps) {
  const t = useTranslations("smartPicks.page");
  const completionPct =
    coverage.total > 0
      ? Math.round((coverage.filled / coverage.total) * 100)
      : 0;

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 shadow-soft sm:p-5">
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-sm font-bold text-foreground sm:text-[15px]">
            {t("coverage.title")}
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            {t("coverage.summary", {
              filled: coverage.filled,
              total: coverage.total,
            })}
          </p>
        </div>
        <span className="font-display text-base font-bold tabular-nums text-foreground sm:text-lg">
          {coverage.filled}/{coverage.total}
        </span>
      </div>

      {coverage.total > 0 ? (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${completionPct}%` }}
            aria-hidden="true"
          />
        </div>
      ) : null}

      <ul
        className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border"
        role="list"
      >
        {coverage.slots.map((slot) => (
          <CoverageSlotRow key={slot.role} slot={slot} />
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
        <LegendDot tone="filled">{t("coverage.states.filled")}</LegendDot>
        <LegendDot tone="missing-priority">
          {t("coverage.states.missing-priority")}
        </LegendDot>
        <LegendDot tone="missing">{t("coverage.states.missing")}</LegendDot>
      </div>
    </section>
  );
}

function CoverageSlotRow({ slot }: { slot: SmartPicksCoverageSlot }) {
  const t = useTranslations("smartPicks.page");
  const roleIcon = ROLE_ICON[slot.role] ?? (
    <Sparkles className="h-4 w-4" aria-hidden="true" />
  );

  return (
    <li
      className={cn(
        "flex items-center gap-3 px-3 py-2.5",
        slot.state === "filled" && "bg-accent-soft/60",
        slot.state === "missing-priority" && "bg-warning-soft/60",
        slot.state === "missing" && "bg-surface",
      )}
    >
      <div
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-lg border",
          slot.state === "filled" &&
            "border-[color:rgba(47,122,82,0.32)] bg-gradient-to-br from-[#d1ecdb] to-[#a4d4b6] text-accent-strong",
          slot.state === "missing-priority" &&
            "border-dashed border-[color:rgba(184,84,10,0.4)] bg-surface text-[color:var(--warning)]",
          slot.state === "missing" &&
            "border-dashed border-[color:var(--border-strong)] bg-surface text-muted",
        )}
        aria-hidden="true"
      >
        {slot.state === "filled" ? roleIcon : <Plus className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "text-[10px] font-bold uppercase tracking-[0.08em]",
            slot.state === "filled" && "text-accent-strong",
            slot.state === "missing-priority" && "text-[color:var(--warning)]",
            slot.state === "missing" && "text-muted",
          )}
        >
          {t(`roles.${slot.role}`)}
        </div>
        <div
          className={cn(
            "text-[13px] leading-snug",
            slot.state === "filled"
              ? "font-medium text-foreground"
              : "italic text-muted",
          )}
        >
          {slot.filledByName ?? t(`coverage.states.${slot.state}`)}
        </div>
      </div>
      <span
        className={cn(
          "shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em]",
          slot.state === "filled" &&
            "bg-accent text-background",
          slot.state === "missing-priority" &&
            "bg-[color:var(--warning)] text-background",
          slot.state === "missing" &&
            "border border-border bg-surface-muted text-muted",
        )}
      >
        {t(`coverage.states.${slot.state}`)}
      </span>
    </li>
  );
}

function LegendDot({
  tone,
  children,
}: {
  tone: SmartPicksCoverageSlot["state"];
  children: ReactNode;
}) {
  const dot =
    tone === "filled" ? (
      <CheckCircle2
        className="h-3 w-3 text-accent-strong"
        aria-hidden="true"
      />
    ) : tone === "missing-priority" ? (
      <span
        className="inline-block h-2 w-2 rounded-full bg-[color:var(--warning)]"
        aria-hidden="true"
      />
    ) : (
      <CircleDashed className="h-3 w-3 text-muted" aria-hidden="true" />
    );
  return (
    <span className="inline-flex items-center gap-1.5">
      {dot}
      {children}
    </span>
  );
}
