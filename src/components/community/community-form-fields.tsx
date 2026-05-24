import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { CommunityDisclosureType } from "@/types/community";
import { communityDisclosureTypes } from "./community-constants";

const COMMUNITY_SELECT_EMPTY = "__none__";

export type CommunitySelectOption = { value: string; label: string };

export function Field({
  children,
  hint,
  label,
  required,
}: {
  children: ReactNode;
  hint?: string;
  label: string;
  required?: boolean;
}) {
  const t = useTranslations("community.shared");
  return (
    <div className="grid gap-1.5">
      <Label className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
        {label}
        {required ? (
          <span
            aria-label={t("required")}
            className="text-sm leading-none text-danger"
          >
            *
          </span>
        ) : null}
      </Label>
      {hint ? <p className="text-xs leading-5 text-muted">{hint}</p> : null}
      {children}
    </div>
  );
}

export function FormGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

export function FormSection({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <section className="grid gap-5">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function CommunityFieldError({
  errors,
}: {
  errors: readonly unknown[];
}) {
  const message = readFirstFieldError(errors);
  return message ? (
    <span className="text-xs font-medium text-danger" role="alert">
      {message}
    </span>
  ) : null;
}

export { Textarea as CommunityTextarea } from "@/components/ui/textarea";

export function CommunityTextareaField({
  field,
  hint,
  label,
  placeholder,
  required,
  maxLength,
}: {
  field: {
    handleBlur: () => void;
    handleChange: (value: string) => void;
    name: string;
    state: {
      meta: { errors: readonly unknown[] };
      value: string;
    };
  };
  hint?: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
}) {
  const value = field.state.value ?? "";
  const invalid = field.state.meta.errors.length > 0;
  return (
    <Field hint={hint} label={label} required={required}>
      <Textarea
        name={field.name}
        value={value}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={invalid}
        className={cn(invalid && "border-danger focus-visible:ring-danger/30")}
      />
      <div className="flex items-center justify-between">
        <CommunityFieldError errors={field.state.meta.errors} />
        {maxLength ? (
          <span className="ml-auto text-[11px] tabular-nums text-muted">
            {value.length}/{maxLength}
          </span>
        ) : null}
      </div>
    </Field>
  );
}

export function CommunitySelectField({
  field,
  hint,
  label,
  options,
  placeholder,
  required,
}: {
  field: {
    handleBlur: () => void;
    handleChange: (value: string) => void;
    name: string;
    state: {
      meta: { errors: readonly unknown[] };
      value: string;
    };
  };
  hint?: string;
  label: string;
  options: readonly CommunitySelectOption[];
  placeholder?: string;
  required?: boolean;
}) {
  const t = useTranslations("community.shared");
  const invalid = field.state.meta.errors.length > 0;
  const raw = field.state.value ?? "";
  const effectivePlaceholder = placeholder ?? t("selectPlaceholder");
  return (
    <Field hint={hint} label={label} required={required}>
      <Select
        value={raw === "" ? COMMUNITY_SELECT_EMPTY : raw}
        onValueChange={(next) =>
          field.handleChange(next === COMMUNITY_SELECT_EMPTY ? "" : next)
        }
      >
        <SelectTrigger
          aria-invalid={invalid}
          onBlur={field.handleBlur}
          className={cn(
            invalid && "border-danger focus-visible:ring-danger/30",
          )}
        >
          <SelectValue placeholder={effectivePlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {!required ? (
            <SelectItem value={COMMUNITY_SELECT_EMPTY}>
              {effectivePlaceholder}
            </SelectItem>
          ) : null}
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <HiddenSelectMirror
        name={field.name}
        value={raw}
        options={options}
        onChange={field.handleChange}
        placeholder={effectivePlaceholder}
      />
      <CommunityFieldError errors={field.state.meta.errors} />
    </Field>
  );
}

export function CommunitySimpleSelect({
  className,
  disabled,
  hint,
  label,
  name,
  onChange,
  options,
  placeholder,
  required,
  value,
}: {
  className?: string;
  disabled?: boolean;
  hint?: string;
  label?: string;
  name?: string;
  onChange: (value: string) => void;
  options: readonly CommunitySelectOption[];
  placeholder?: string;
  required?: boolean;
  value: string;
}) {
  const t = useTranslations("community.shared");
  const effectivePlaceholder = placeholder ?? t("selectPlaceholder");
  const body = (
    <>
      <Select
        value={value === "" ? COMMUNITY_SELECT_EMPTY : value}
        onValueChange={(next) =>
          onChange(next === COMMUNITY_SELECT_EMPTY ? "" : next)
        }
        disabled={disabled}
      >
        <SelectTrigger className={className}>
          <SelectValue placeholder={effectivePlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {!required ? (
            <SelectItem value={COMMUNITY_SELECT_EMPTY}>
              {effectivePlaceholder}
            </SelectItem>
          ) : null}
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {name ? (
        <HiddenSelectMirror
          name={name}
          value={value}
          options={options}
          onChange={onChange}
          placeholder={effectivePlaceholder}
        />
      ) : null}
    </>
  );
  if (!label) {
    return body;
  }
  return (
    <Field hint={hint} label={label} required={required}>
      {body}
    </Field>
  );
}

function HiddenSelectMirror({
  name,
  onChange,
  options,
  placeholder,
  value,
}: {
  name: string;
  onChange: (value: string) => void;
  options: readonly CommunitySelectOption[];
  placeholder: string;
  value: string;
}) {
  return (
    <select
      aria-hidden
      tabIndex={-1}
      name={name}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="sr-only"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function CommunityDisclosureSelect({
  field,
}: {
  field: {
    handleBlur: () => void;
    handleChange: (value: CommunityDisclosureType) => void;
    name: string;
    state: {
      meta: { errors: readonly unknown[] };
      value: CommunityDisclosureType;
    };
  };
}) {
  const t = useTranslations("community.shared");
  const tOptions = useTranslations("community.options.disclosure");
  const invalid = field.state.meta.errors.length > 0;
  return (
    <Field hint={t("disclosureHint")} label={t("disclosureLabel")} required>
      <Select
        name={field.name}
        value={field.state.value}
        onValueChange={(value) =>
          field.handleChange(value as CommunityDisclosureType)
        }
      >
        <SelectTrigger
          aria-invalid={invalid}
          onBlur={field.handleBlur}
          className={cn(
            invalid && "border-danger focus-visible:ring-danger/30",
          )}
        >
          <SelectValue placeholder={t("disclosurePlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          {communityDisclosureTypes.map((value) => (
            <SelectItem key={value} value={value}>
              {tOptions(value)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <CommunityFieldError errors={field.state.meta.errors} />
    </Field>
  );
}

function readFirstFieldError(errors: readonly unknown[]) {
  const issue = errors.find(Boolean);
  if (typeof issue === "string") return issue;
  if (issue instanceof Error) return issue.message;
  if (typeof issue === "object" && issue !== null && "message" in issue) {
    const message = (issue as { message?: unknown }).message;
    return typeof message === "string" ? message : undefined;
  }
  return undefined;
}
