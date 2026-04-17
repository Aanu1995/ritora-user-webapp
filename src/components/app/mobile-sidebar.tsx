"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { GuardedLink } from "@/components/app/guarded-link";
import { RitoraMark } from "@/components/icons/ritora-mark";
import { cn } from "@/lib/utils";
import { AppRoute } from "@/constants/app-routes";
import { getNavItemsByGroup, NavGroup, type NavItem } from "@/constants/nav-config";

function MobileNavList({
  items,
  pathname,
  t,
  onClose,
}: {
  items: NavItem[];
  pathname: string;
  t: (key: string) => string;
  onClose: () => void;
}) {
  return (
    <ul role="list" className="-mx-2 space-y-1">
      {items.map((item) => {
        const isActive =
          item.route === AppRoute.Dashboard
            ? pathname === AppRoute.Dashboard
            : pathname === item.route || pathname.startsWith(item.route + "/");
        const Icon = item.icon;

        return (
          <li key={item.route}>
            <GuardedLink
              href={item.route}
              onClick={onClose}
              className={cn(
                "group flex gap-x-3 rounded-lg p-2.5 text-sm font-medium leading-6 transition-colors",
                isActive
                  ? "bg-accent-soft text-accent-strong"
                  : "text-muted hover:bg-accent/5 hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {t(`items.${item.labelKey}`)}
            </GuardedLink>
          </li>
        );
      })}
    </ul>
  );
}

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const t = useTranslations("sidebar");
  const pathname = usePathname();
  const mainItems = getNavItemsByGroup(NavGroup.Main);
  const moreItems = getNavItemsByGroup(NavGroup.More);
  const accountItems = getNavItemsByGroup(NavGroup.Account);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div className={cn("lg:hidden", !open && "pointer-events-none")}>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-surface transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          type="button"
          className="absolute right-4 top-4 cursor-pointer rounded-lg p-2 text-muted hover:text-foreground"
          onClick={onClose}
        >
          <span className="sr-only">{t("toggleSidebar")}</span>
          <X className="h-5 w-5" />
        </button>

        <div className="flex h-full flex-col gap-y-5 overflow-y-auto px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <GuardedLink
              href={AppRoute.Dashboard}
              className="flex items-center gap-3"
              onClick={onClose}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent-strong">
                <RitoraMark className="h-5 w-5" />
              </span>
              <span className="text-xl font-semibold tracking-tight text-foreground">
                Ritora
              </span>
            </GuardedLink>
          </div>

          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <MobileNavList items={mainItems} pathname={pathname} t={t} onClose={onClose} />
              </li>
              <li>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {t("groups.more")}
                </div>
                <div className="mt-2">
                  <MobileNavList items={moreItems} pathname={pathname} t={t} onClose={onClose} />
                </div>
              </li>
              <li className="mt-auto">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {t("groups.account")}
                </div>
                <div className="mt-2">
                  <MobileNavList items={accountItems} pathname={pathname} t={t} onClose={onClose} />
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
