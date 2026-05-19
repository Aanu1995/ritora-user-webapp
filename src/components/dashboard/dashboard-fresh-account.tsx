"use client";

import { ArrowRight, ScanSearch, UserCircle } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AppRoute } from "@/constants/app-routes";
import { DashboardPromises } from "./dashboard-promises";
import { DashboardSetupChecklist } from "./dashboard-setup-checklist";

type Props = {
  profileDone: boolean;
  shelfDone: boolean;
  routineDone: boolean;
};

export function DashboardFreshAccount({
  profileDone,
  shelfDone,
  routineDone,
}: Props) {
  const t = useTranslations("dashboard.fresh");

  return (
    <div className="mx-auto mt-6 flex max-w-3xl flex-col gap-5">
      <section
        className="rounded-3xl border border-accent/20 bg-gradient-to-b from-accent-soft to-surface p-6 shadow-[var(--shadow-soft)] sm:p-8"
        aria-labelledby="fresh-account-title"
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-accent-strong">
          {t("eyebrow")}
        </p>
        <h2
          id="fresh-account-title"
          className="mt-3 font-display text-2xl font-bold -tracking-[0.01em] text-foreground sm:text-[28px]"
        >
          {t("title")}
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          {t("body")}
        </p>

        <div className="mt-5">
          <Button asChild size="sm">
            <Link href={AppRoute.SkinProfile}>
              <UserCircle className="h-4 w-4" aria-hidden />
              {t("primaryCta")}
            </Link>
          </Button>
        </div>

        <p className="mt-4 text-sm text-muted">
          {t("secondary")}{" "}
          <Link
            href={AppRoute.CheckProduct}
            className="inline-flex items-center gap-1 font-bold text-accent-strong hover:underline"
          >
            <ScanSearch className="h-3.5 w-3.5" aria-hidden />
            {t("secondaryCta")}
            <ArrowRight className="h-3 w-3" aria-hidden />
          </Link>
        </p>
      </section>

      <DashboardSetupChecklist
        profileDone={profileDone}
        shelfDone={shelfDone}
        routineDone={routineDone}
      />

      <DashboardPromises />
    </div>
  );
}
