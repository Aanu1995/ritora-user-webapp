"use client";

import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const ALL = "__all__";

export type CommunityFilterOption = {
  value: string;
  label: string;
};

export function CommunityFilterPanel({
  children,
  onClear,
}: {
  children: ReactNode;
  onClear: () => void;
}) {
  const t = useTranslations("community.filters");
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
      <div className="mt-3 flex justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onClear}>
          {t("clear")}
        </Button>
      </div>
    </div>
  );
}

export function FilterSearchField({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <div className="grid gap-1.5 sm:col-span-2 lg:col-span-3">
      <Label className="text-xs font-medium text-muted">{label}</Label>
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-10 rounded-lg py-2 pl-9 text-sm"
        />
      </div>
    </div>
  );
}

export function FilterSelect({
  allLabel,
  className,
  label,
  onChange,
  options,
  value,
}: {
  allLabel: string;
  className?: string;
  label: string;
  onChange: (value: string) => void;
  options: readonly CommunityFilterOption[];
  value: string;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label className="text-xs font-medium text-muted">{label}</Label>
      <Select
        value={value === "" ? ALL : value}
        onValueChange={(next) => onChange(next === ALL ? "" : next)}
      >
        <SelectTrigger className="h-10 rounded-lg px-3 py-2 text-sm">
          <SelectValue placeholder={allLabel} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{allLabel}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
