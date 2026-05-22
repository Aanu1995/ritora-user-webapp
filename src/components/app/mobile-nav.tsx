"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Bell, House, Menu, ScanSearch, Sparkles } from "lucide-react";
import { GuardedLink } from "@/components/app/guarded-link";
import { useNavBadgeCounts } from "@/hooks/use-nav-badge-counts";
import { cn } from "@/lib/utils";
import { AppRoute } from "@/constants/app-routes";

const mobileNavItems = [
  { labelKey: "home", href: AppRoute.Dashboard, icon: House },
  { labelKey: "check", href: AppRoute.CheckProduct, icon: ScanSearch },
  {
    labelKey: "today",
    href: AppRoute.TodaysSuggestion,
    icon: Sparkles,
  },
  { labelKey: "notifications", href: AppRoute.Notifications, icon: Bell },
] as const;

type MobileNavProps = {
  onMenuClick: () => void;
};

export function MobileNav({ onMenuClick }: MobileNavProps) {
  const t = useTranslations("mobileNav");
  const pathname = usePathname();
  const badgeCounts = useNavBadgeCounts();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background lg:hidden"
      aria-label={t("ariaLabel")}
    >
      <div className="flex h-16 items-center justify-around">
        {mobileNavItems.map((item) => {
          const isActive =
            item.href === AppRoute.Dashboard
              ? pathname === AppRoute.Dashboard
              : pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          const badgeCount = badgeCounts[item.href] ?? 0;
          const badgeLabel =
            badgeCount > 0
              ? t("badge", { count: badgeCount })
              : undefined;

          return (
            <GuardedLink
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors",
                isActive
                  ? "text-accent-strong"
                  : "text-muted hover:text-foreground",
              )}
            >
              <span className="relative inline-flex">
                <Icon className="h-5 w-5" aria-hidden="true" />
                {badgeCount > 0 ? (
                  <span
                    className="absolute -right-2 -top-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white"
                    aria-label={badgeLabel}
                  >
                    {badgeCount > 9 ? "9+" : badgeCount}
                  </span>
                ) : null}
              </span>
              <span>{t(`items.${item.labelKey}`)}</span>
            </GuardedLink>
          );
        })}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label={t("menuAriaLabel")}
          className="flex flex-col items-center gap-1 px-3 py-2 text-xs text-muted transition-colors hover:text-foreground"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
          <span>{t("items.more")}</span>
        </button>
      </div>
    </nav>
  );
}
