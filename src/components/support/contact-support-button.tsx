"use client";

import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import {
  isCapabilityDisabled,
  useUserCapabilities,
} from "@/hooks/use-user-capabilities";
import { cn } from "@/lib/utils";
import { SupportDialog } from "./support-dialog";

type ButtonVariant = ComponentProps<typeof Button>["variant"];
type ButtonSize = ComponentProps<typeof Button>["size"];

type ContactSupportButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * Hide the text label, keeping just the icon. Useful in dense headers
   * where the icon plus an `aria-label` is enough.
   */
  iconOnly?: boolean;
  /**
   * Override the visible label. Defaults to `settings.account.support.contactAction`.
   */
  label?: string;
  className?: string;
};

/**
 * Self-contained button that opens the support feedback dialog. Owns its
 * own open/close state and disables itself if the current user lacks the
 * support_contact capability (e.g. restricted accounts).
 *
 * Drop it anywhere: dashboard header, error panels, settings, empty states.
 */
export function ContactSupportButton({
  variant = "outline",
  size = "sm",
  iconOnly = false,
  label,
  className,
}: ContactSupportButtonProps) {
  const t = useTranslations("settings.account");
  const capabilities = useUserCapabilities();
  const [open, setOpen] = useState(false);

  const supportDisabled = isCapabilityDisabled(capabilities.supportContact);
  const resolvedLabel = label ?? t("support.contactAction");

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={supportDisabled}
        onClick={() => setOpen(true)}
        aria-label={iconOnly ? resolvedLabel : undefined}
        className={cn(className)}
      >
        <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
        {iconOnly ? null : resolvedLabel}
      </Button>

      {open ? <SupportDialog open={open} onOpenChange={setOpen} /> : null}
    </>
  );
}
