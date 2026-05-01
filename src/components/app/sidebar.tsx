"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { GuardedLink } from "@/components/app/guarded-link";
import { NavBadge } from "@/components/app/nav-badge";
import { RitoraMark } from "@/components/icons/ritora-mark";
import { cn } from "@/lib/utils";
import { AppRoute } from "@/constants/app-routes";
import { getNavItemsByGroup, NavGroup, type NavItem } from "@/constants/nav-config";
import {
  useNavBadgeCounts,
  type NavBadgeCounts,
} from "@/hooks/use-nav-badge-counts";

function NavList({
  items,
  pathname,
  t,
  badgeCounts,
}: {
  items: NavItem[];
  pathname: string;
  t: ReturnType<typeof useTranslations>;
  badgeCounts: NavBadgeCounts;
}) {
  return (
    <ul role="list" className="-mx-2 space-y-1">
      {items.map((item) => {
        const isActive =
          item.route === AppRoute.Dashboard
            ? pathname === AppRoute.Dashboard
            : pathname === item.route || pathname.startsWith(item.route + "/");
        const Icon = item.icon;
        const badgeCount = badgeCounts[item.route] ?? 0;

        return (
          <li key={item.route}>
            <GuardedLink
              href={item.route}
              className={cn(
                "group flex items-center gap-x-3 rounded-lg p-2.5 text-sm font-medium leading-6 transition-colors",
                isActive
                  ? "bg-accent-soft text-accent-strong"
                  : "text-muted hover:bg-accent/5 hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="flex-1">{t(`items.${item.labelKey}`)}</span>
              <NavBadge
                count={badgeCount}
                ariaLabel={t("badgeLabel", { count: badgeCount })}
              />
            </GuardedLink>
          </li>
        );
      })}
    </ul>
  );
}

export function Sidebar() {
  const t = useTranslations("sidebar");
  const pathname = usePathname();
  const mainItems = getNavItemsByGroup(NavGroup.Main);
  const moreItems = getNavItemsByGroup(NavGroup.More);
  const accountItems = getNavItemsByGroup(NavGroup.Account);
  const badgeCounts = useNavBadgeCounts();

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col border-r border-border bg-surface">
      {/* Logo — fixed, never scrolls */}
      <div className="flex h-16 shrink-0 items-center px-6">
        <GuardedLink href={AppRoute.Dashboard} className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent-strong">
            <RitoraMark className="h-5 w-5" />
          </span>
          <span className="text-xl font-semibold tracking-tight text-foreground">
            Ritora
          </span>
        </GuardedLink>
      </div>

      {/* Nav — scrollable independently */}
      <nav className="flex flex-1 flex-col overflow-y-auto px-6 pb-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <NavList items={mainItems} pathname={pathname} t={t} badgeCounts={badgeCounts} />
          </li>

          <li>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted">
              {t("groups.more")}
            </div>
            <div className="mt-2">
              <NavList items={moreItems} pathname={pathname} t={t} badgeCounts={badgeCounts} />
            </div>
          </li>

          <li className="mt-auto">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted">
              {t("groups.account")}
            </div>
            <div className="mt-2">
              <NavList items={accountItems} pathname={pathname} t={t} badgeCounts={badgeCounts} />
            </div>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
