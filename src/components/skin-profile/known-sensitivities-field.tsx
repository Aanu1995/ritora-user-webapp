"use client";

import type { KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface KnownSensitivitiesFieldProps {
  inputValue: string;
  values: string[];
  errorText?: string;
  onInputChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (value: string) => void;
}

export function KnownSensitivitiesField({
  inputValue,
  values,
  errorText,
  onInputChange,
  onAdd,
  onRemove,
}: KnownSensitivitiesFieldProps) {
  const t = useTranslations("skinProfile");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onAdd();
    }
  };

  return (
    <div className="mt-8">
      <p className="text-sm font-medium text-foreground">
        {t("sensitivitiesLabel")}
      </p>
      <p className="mt-1 text-sm text-muted">{t("sensitivitiesHint")}</p>

      <div className="mt-3 flex gap-2">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("sensitivitiesPlaceholder")}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
          disabled={!inputValue.trim()}
          className="gap-1.5 rounded-full px-4"
        >
          <Plus className="h-3.5 w-3.5" />
          {t("sensitivitiesAdd")}
        </Button>
      </div>

      {errorText ? (
        <p className="mt-3 text-sm text-danger" role="alert">
          {errorText}
        </p>
      ) : null}

      {values.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {values.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3 py-1.5 text-sm text-foreground"
            >
              {value}
              <button
                type="button"
                onClick={() => onRemove(value)}
                className="cursor-pointer rounded-full text-muted transition-colors hover:text-foreground"
                aria-label={t("sensitivitiesRemove", { value })}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
