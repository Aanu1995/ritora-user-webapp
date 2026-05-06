"use client";

import { ArrowLeft } from "lucide-react";
import { GuardedLink } from "@/components/app/guarded-link";

interface BackButtonProps {
  href: string;
  label: string;
}

export function BackButton({ href, label }: BackButtonProps) {
  return (
    <GuardedLink
      href={href}
      aria-label={label}
      className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface text-foreground hover:bg-accent-soft"
    >
      <ArrowLeft className="h-4 w-4" />
    </GuardedLink>
  );
}
