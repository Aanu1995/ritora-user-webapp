"use client";

import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import { GuardedLink } from "@/components/app/guarded-link";
import { RitoraMark } from "@/components/icons/ritora-mark";
import { AppRoute } from "@/constants/app-routes";

interface SidebarMobileTopBarProps {
  onMenuClick: () => void;
}

export function SidebarMobileTopBar({ onMenuClick }: SidebarMobileTopBarProps) {
  const t = useTranslations("sidebar");

  return (
    <div className="flex h-14 items-center gap-3 border-b border-border bg-background px-4 lg:hidden">
      <button
        type="button"
        className="-m-2 cursor-pointer rounded-lg p-2 text-muted hover:text-foreground"
        onClick={onMenuClick}
      >
        <span className="sr-only">{t("toggleSidebar")}</span>
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>
      <div className="h-5 w-px bg-border" aria-hidden="true" />
      <GuardedLink
        href={AppRoute.Dashboard}
        className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent-strong">
          <RitoraMark className="h-5 w-5" />
        </span>
        Ritora
      </GuardedLink>
    </div>
  );
}
