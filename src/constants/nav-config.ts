import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CalendarClock,
  ChartLine,
  House,
  NotebookPen,
  ScanFace,
  Settings,
  Sparkles,
  Store,
  Wand,
} from "lucide-react";
import { AppRoute } from "./app-routes";

export enum NavItemStatus {
  Live = "live",
  Planned = "planned",
}

export enum NavGroup {
  Main = "main",
  More = "more",
  Account = "account",
}

export type NavItem = {
  route: AppRoute;
  icon: LucideIcon;
  labelKey: string;
  descriptionKey: string;
  group: NavGroup;
  status: NavItemStatus;
};

export const NAV_ITEMS: NavItem[] = [
  {
    route: AppRoute.Dashboard,
    icon: House,
    labelKey: "home",
    descriptionKey: "homeDescription",
    group: NavGroup.Main,
    status: NavItemStatus.Live,
  },
  {
    route: AppRoute.SkinProfile,
    icon: ScanFace,
    labelKey: "skinProfile",
    descriptionKey: "skinProfileDescription",
    group: NavGroup.Main,
    status: NavItemStatus.Live,
  },
  {
    route: AppRoute.Shelf,
    icon: Store,
    labelKey: "shelf",
    descriptionKey: "shelfDescription",
    group: NavGroup.Main,
    status: NavItemStatus.Live,
  },
  {
    route: AppRoute.TodaysSuggestion,
    icon: Sparkles,
    labelKey: "todaysSuggestion",
    descriptionKey: "todaysSuggestionDescription",
    group: NavGroup.Main,
    status: NavItemStatus.Planned,
  },
  {
    route: AppRoute.Journal,
    icon: NotebookPen,
    labelKey: "skinJournal",
    descriptionKey: "skinJournalDescription",
    group: NavGroup.Main,
    status: NavItemStatus.Planned,
  },
  {
    route: AppRoute.SmartPicks,
    icon: Wand,
    labelKey: "smartPicks",
    descriptionKey: "smartPicksDescription",
    group: NavGroup.Main,
    status: NavItemStatus.Planned,
  },
  {
    route: AppRoute.History,
    icon: CalendarClock,
    labelKey: "history",
    descriptionKey: "historyDescription",
    group: NavGroup.More,
    status: NavItemStatus.Planned,
  },
  {
    route: AppRoute.Insights,
    icon: ChartLine,
    labelKey: "insights",
    descriptionKey: "insightsDescription",
    group: NavGroup.More,
    status: NavItemStatus.Planned,
  },
  {
    route: AppRoute.Notifications,
    icon: Bell,
    labelKey: "notifications",
    descriptionKey: "notificationsDescription",
    group: NavGroup.Account,
    status: NavItemStatus.Planned,
  },
  {
    route: AppRoute.Settings,
    icon: Settings,
    labelKey: "settings",
    descriptionKey: "settingsDescription",
    group: NavGroup.Account,
    status: NavItemStatus.Live,
  },
];

export function getNavItemsByGroup(group: NavGroup): NavItem[] {
  return NAV_ITEMS.filter((item) => item.group === group);
}
