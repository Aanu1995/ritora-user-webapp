"use client";

import { useTranslations } from "next-intl";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RECENT_CHANGE_KINDS,
  type RecentChange,
  type RecentChangeKind,
} from "@/types/skin-journal";

interface RecentChangeInputProps {
  value?: RecentChange | null;
  onChange?: (next: RecentChange | null) => void;
}

export function RecentChangeInput({
  value,
  onChange,
}: RecentChangeInputProps) {
  const t = useTranslations("journal.recentChange");
  const tKinds = useTranslations("journal.recentChange.kinds");
  const enabled = !!value;

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{t("label")}</p>
        <Switch
          checked={enabled}
          onCheckedChange={(next) =>
            onChange?.(
              next
                ? {
                    kind: value?.kind ?? "started_new_product",
                    related_inventory_product_id:
                      value?.related_inventory_product_id ?? null,
                    note: value?.note ?? null,
                  }
                : null,
            )
          }
          aria-label={t("label")}
        />
      </div>
      <p className="mt-1 mb-3 text-xs text-muted">{t("hint")}</p>

      {enabled ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold">
              {t("typeLabel")}
            </label>
            <Select
              value={value?.kind ?? "started_new_product"}
              onValueChange={(kind) =>
                onChange?.({
                  ...(value ?? { related_inventory_product_id: null, note: null }),
                  kind: kind as RecentChangeKind,
                })
              }
            >
              <SelectTrigger className="!h-9 w-full rounded-lg !px-2.5 !py-2 !text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RECENT_CHANGE_KINDS.map((kind) => (
                  <SelectItem
                    key={kind}
                    value={kind}
                    className="cursor-pointer text-xs"
                  >
                    {tKinds(kind)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold">
              {t("productLabel")}
            </label>
            <input
              type="text"
              placeholder={t("productPlaceholder")}
              className="w-full rounded-lg border border-border-strong bg-surface px-2.5 py-2 text-xs text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
              value={value?.note ?? ""}
              onChange={(e) =>
                onChange?.({
                  ...(value ?? {
                    kind: "started_new_product",
                    related_inventory_product_id: null,
                  }),
                  note: e.target.value,
                })
              }
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
