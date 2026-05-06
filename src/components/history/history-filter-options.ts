import {
  Check,
  Circle,
  CircleSlash,
  Clock3,
  Moon,
  Sparkles,
  Sun,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export type HistoryFilterOption = {
  value: string;
  labelKey: string;
  Icon: LucideIcon;
};

export const DAYPART_FILTERS = [
  { value: "morning", labelKey: "morning", Icon: Sun },
  { value: "noon", labelKey: "noon", Icon: Clock3 },
  { value: "evening", labelKey: "evening", Icon: Moon },
] as const;

export const STATUS_FILTERS = [
  { value: "applied", labelKey: "applied", Icon: Check },
  { value: "partial", labelKey: "partial", Icon: Circle },
  { value: "skipped", labelKey: "skipped", Icon: CircleSlash },
  { value: "simplified", labelKey: "simplified", Icon: Sparkles },
  { value: "missed", labelKey: "missed", Icon: CircleSlash },
] as const;

export const MODE_FILTERS = [
  { value: "ai", labelKey: "ai", Icon: Sparkles },
  { value: "manual", labelKey: "manual", Icon: UserRound },
  { value: "mixed", labelKey: "mixed", Icon: Circle },
] as const;
