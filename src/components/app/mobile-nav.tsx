"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  BarChart3,
  LayoutDashboard,
  Settings2,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { GuardedLink } from "@/components/app/guarded-link";
import { cn } from "@/lib/utils";
import { AppRoute } from "@/constants/app-routes";

const mobileNavItems = [
  { labelKey: "home", href: AppRoute.Dashboard, icon: LayoutDashboard },
  { labelKey: "shelf", href: AppRoute.Shelf, icon: ShoppingBag },
  { labelKey: "todaysSuggestion", href: AppRoute.TodaysSuggestion, icon: Sparkles },
  { labelKey: "insights", href: AppRoute.Insights, icon: BarChart3 },
  { labelKey: "settings", href: AppRoute.Settings, icon: Settings2 },
] as const;

export function MobileNav() {
  const t = useTranslations("sidebar");
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background lg:hidden">
      <div className="flex h-16 items-center justify-around">
        {mobileNavItems.map((item) => {
          const isActive =
            item.href === AppRoute.Dashboard
              ? pathname === AppRoute.Dashboard
              : pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

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
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{t(`items.${item.labelKey}`)}</span>
            </GuardedLink>
          );
        })}
      </div>
    </nav>
  );
}
