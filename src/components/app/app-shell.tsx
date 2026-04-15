"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  CircleDashed,
  Gauge,
  LogOut,
  Menu,
  Package2,
  ScanSearch,
  Settings2,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { RitoraMark } from "@/components/icons/ritora-mark";
import { Button } from "@/components/ui/button";
import { AppRoute } from "@/constants/app-routes";
import { useSkinProfile } from "@/hooks/use-skin-profile";
import { getSkinProfileSetupStatus } from "@/lib/skin-profile-setup";
import { useLogout } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

type LiveWorkspaceItem = {
  href: AppRoute;
  label: string;
  description: string;
  icon: typeof Gauge;
  badge?: string;
};

type PlannedWorkspaceItem = {
  label: string;
  description: string;
  icon: typeof Gauge;
  children: string[];
};

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const t = useTranslations("workspace");
  const pathname = usePathname();
  const logout = useLogout();
  const user = useAuthStore((state) => state.user);
  const skinProfile = useSkinProfile();
  const skinProfileSetup = getSkinProfileSetupStatus(skinProfile.data ?? null);
  const [mobileNavPath, setMobileNavPath] = useState<string | null>(null);
  const mobileNavOpen = mobileNavPath === pathname;

  useEffect(() => {
    if (!mobileNavOpen) {
      return;
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileNavPath(null);
      }
    };

    document.addEventListener("keydown", handleKeydown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileNavOpen]);

  const liveItems: LiveWorkspaceItem[] = [
    {
      href: AppRoute.Dashboard,
      label: t("items.dashboard.label"),
      description: t("items.dashboard.description"),
      icon: Gauge,
    },
    {
      href: AppRoute.SkinProfile,
      label: t("items.skinProfile.label"),
      description: t("items.skinProfile.description"),
      icon: UserRound,
      badge: skinProfileSetup.hasProfile
        ? skinProfileSetup.isCoreComplete
          ? t("badges.ready")
          : t("badges.continue")
        : t("badges.start"),
    },
    {
      href: AppRoute.Settings,
      label: t("items.settings.label"),
      description: t("items.settings.description"),
      icon: Settings2,
    },
  ];

  const plannedItems: PlannedWorkspaceItem[] = [
    {
      label: t("planned.inventory.label"),
      description: t("planned.inventory.description"),
      icon: Package2,
      children: [
        t("planned.inventory.children.catalogue"),
        t("planned.inventory.children.history"),
      ],
    },
    {
      label: t("planned.routines.label"),
      description: t("planned.routines.description"),
      icon: Sparkles,
      children: [
        t("planned.routines.children.daily"),
        t("planned.routines.children.onDemand"),
      ],
    },
    {
      label: t("planned.progress.label"),
      description: t("planned.progress.description"),
      icon: ScanSearch,
      children: [
        t("planned.progress.children.checkIns"),
        t("planned.progress.children.timeline"),
      ],
    },
    {
      label: t("planned.analysis.label"),
      description: t("planned.analysis.description"),
      icon: CircleDashed,
      children: [
        t("planned.analysis.children.gaps"),
        t("planned.analysis.children.suggestions"),
      ],
    },
  ];

  const sidebar = (
    <div className="flex h-full flex-col rounded-4xl border border-border bg-surface/90 p-5 shadow-soft backdrop-blur-sm">
      <div className="flex items-start justify-between gap-4">
        <Link
          href={AppRoute.Dashboard}
          className="inline-flex items-center gap-3 text-left"
          onClick={() => setMobileNavPath(null)}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent-strong">
            <RitoraMark className="h-7 w-7" />
          </span>
          <span>
            <span className="block text-base font-semibold tracking-tight text-foreground">
              Ritora
            </span>
            <span className="block text-sm text-muted">
              {t("sidebarSubtitle")}
            </span>
          </span>
        </Link>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full lg:hidden"
          aria-label={t("closeNavigation")}
          onClick={() => setMobileNavPath(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {!skinProfileSetup.isCoreComplete ? (
        <div className="mt-6 rounded-3xl border border-border bg-background/90 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">
            {t("setupTitle")}
          </p>
          <p className="mt-2 text-sm text-foreground">
            {skinProfileSetup.hasProfile
              ? t("setupContinueDescription")
              : t("setupStartDescription")}
          </p>
          <Button asChild className="mt-4 w-full">
            <Link
              href={AppRoute.Onboarding}
              onClick={() => setMobileNavPath(null)}
            >
              {skinProfileSetup.hasProfile
                ? t("continueSkinProfile")
                : t("startSkinProfile")}
            </Link>
          </Button>
        </div>
      ) : null}

      <div className="mt-6 flex-1 space-y-6 overflow-y-auto pr-1">
        <section>
          <p className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            {t("liveSection")}
          </p>
          <div className="mt-3 space-y-2">
            {liveItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavPath(null)}
                  className={cn(
                    "group flex items-start gap-3 rounded-2xl px-3 py-3 transition",
                    isActive
                      ? "bg-accent-soft text-accent-strong"
                      : "hover:bg-background/80",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border transition",
                      isActive
                        ? "border-accent/20 bg-background text-accent-strong"
                        : "border-border bg-background text-muted group-hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {item.label}
                      </span>
                      {item.badge ? (
                        <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                          {item.badge}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block text-sm text-muted">
                      {item.description}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <p className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            {t("plannedSection")}
          </p>
          <div className="mt-3 space-y-3">
            {plannedItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-3xl border border-border bg-background/80 p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-muted">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {item.label}
                        </p>
                        <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                          {t("soonBadge")}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        {item.description}
                      </p>
                      <ul className="mt-3 space-y-1 text-sm text-muted">
                        {item.children.map((child) => (
                          <li key={child} className="flex items-start gap-2">
                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent/60" />
                            <span>{child}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="mt-6 rounded-3xl border border-border bg-background/90 p-4">
        <p className="text-sm font-semibold text-foreground">
          {user?.firstName} {user?.lastName}
        </p>
        <p className="mt-1 text-sm text-muted">{user?.email}</p>
        <p className="mt-3 text-sm text-muted">
          {skinProfileSetup.isCoreComplete
            ? t("accountReady")
            : t("accountNeedsSetup")}
        </p>
        <div className="mt-4 flex gap-2">
          <Button asChild variant="outline" className="flex-1 rounded-full">
            <Link
              href={AppRoute.Settings}
              onClick={() => setMobileNavPath(null)}
            >
              {t("manageSettings")}
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="rounded-full px-3"
            disabled={logout.isPending}
            onClick={() => logout.mutate()}
          >
            <LogOut className="h-4 w-4" />
            {logout.isPending ? t("loggingOut") : t("logout")}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex w-full max-w-384 gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <aside className="hidden w-80 shrink-0 lg:sticky lg:top-4 lg:flex lg:h-[calc(100vh-2rem)]">
          {sidebar}
        </aside>

        {mobileNavOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label={t("closeNavigation")}
              className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
              onClick={() => setMobileNavPath(null)}
            />
            <div className="absolute inset-y-0 left-0 w-[min(88vw,22rem)] p-4">
              {sidebar}
            </div>
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between rounded-3xl border border-border bg-surface/80 px-4 py-3 shadow-soft backdrop-blur-sm lg:hidden">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full"
              aria-label={t("openNavigation")}
              onClick={() => setMobileNavPath(pathname)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Link
              href={AppRoute.Dashboard}
              className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground"
            >
              <RitoraMark className="h-6 w-6 text-accent-strong" />
              Ritora
            </Link>

            <Button asChild variant="ghost" className="rounded-full px-3">
              <Link href={AppRoute.Settings}>{t("items.settings.label")}</Link>
            </Button>
          </div>

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
