"use client";

import { ArrowRight, Check, ListChecks, Package, UserCircle } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { AppRoute } from "@/constants/app-routes";

type Step = {
  key: "profile" | "shelf" | "routine";
  done: boolean;
  href: AppRoute;
  icon: React.ReactNode;
};

type Props = {
  profileDone: boolean;
  shelfDone: boolean;
  routineDone: boolean;
};

export function DashboardSetupChecklist({
  profileDone,
  shelfDone,
  routineDone,
}: Props) {
  const t = useTranslations("dashboard.setup");

  const steps: Step[] = [
    {
      key: "profile",
      done: profileDone,
      href: AppRoute.SkinProfile,
      icon: <UserCircle className="h-4 w-4" aria-hidden />,
    },
    {
      key: "shelf",
      done: shelfDone,
      href: AppRoute.Shelf,
      icon: <Package className="h-4 w-4" aria-hidden />,
    },
    {
      key: "routine",
      done: routineDone,
      href: AppRoute.Schedule,
      icon: <ListChecks className="h-4 w-4" aria-hidden />,
    },
  ];

  const completedCount = steps.filter((step) => step.done).length;

  // Hide once everything's set up — nothing useful to nudge.
  if (completedCount === steps.length) {
    return null;
  }

  return (
    <section
      aria-labelledby="dashboard-setup-heading"
      className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
    >
      <header className="flex items-center justify-between gap-3">
        <h2
          id="dashboard-setup-heading"
          className="font-display text-sm font-bold text-foreground sm:text-[15px]"
        >
          {t("title")}
        </h2>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-semibold text-muted tabular-nums">
          {t("progress", {
            completed: completedCount,
            total: steps.length,
          })}
        </span>
      </header>

      <ul className="mt-3 flex flex-col">
        {steps.map((step) => (
          <li key={step.key}>
            <Link
              href={step.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-2 py-2.5 transition",
                "hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full border transition",
                  step.done
                    ? "border-accent-strong bg-accent-strong text-background"
                    : "border-border-strong bg-surface text-muted",
                )}
              >
                {step.done ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                ) : (
                  step.icon
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    step.done ? "text-muted line-through" : "text-foreground",
                  )}
                >
                  {t(`steps.${step.key}.title`)}
                </p>
                <p className="mt-0.5 text-xs leading-snug text-muted">
                  {step.done
                    ? t(`steps.${step.key}.done`)
                    : t(`steps.${step.key}.todo`)}
                </p>
              </div>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-muted transition group-hover:text-foreground"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
