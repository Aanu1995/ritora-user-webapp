"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import { RitoraMark } from "@/components/icons/ritora-mark";
import { AppRoute } from "@/constants/app-routes";

interface SidebarMobileTopBarProps {
  onMenuClick: () => void;
}

export function SidebarMobileTopBar({ onMenuClick }: SidebarMobileTopBarProps) {
  const t = useTranslations("sidebar");

  return (
    <div className="flex h-14 items-center gap-x-4 border-b border-border bg-background px-4 lg:hidden">
      <button
        type="button"
        className="-m-2 cursor-pointer p-2 text-muted"
        onClick={onMenuClick}
      >
        <span className="sr-only">{t("toggleSidebar")}</span>
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>
      <div className="h-5 w-px bg-border" aria-hidden="true" />
      <Link
        href={AppRoute.Dashboard}
        className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground"
      >
        <RitoraMark className="h-5 w-5 text-accent-strong" />
        Ritora
      </Link>
    </div>
  );
}
