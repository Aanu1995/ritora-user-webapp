"use client";

import { CircleUser, Leaf, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

export function DashboardPromises() {
  const t = useTranslations("dashboard.promises");

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <PromiseCard
        cardClass="border-accent/20 bg-accent-soft"
        iconClass="bg-surface text-accent-strong"
        icon={<ShieldCheck className="h-5 w-5" aria-hidden />}
        title={t("privateTitle")}
        body={t("privateBody")}
      />
      <PromiseCard
        cardClass="border-secondary/20 bg-secondary-soft"
        iconClass="bg-surface text-secondary"
        icon={<Leaf className="h-5 w-5" aria-hidden />}
        title={t("ownedTitle")}
        body={t("ownedBody")}
      />
      <PromiseCard
        cardClass="border-ai-border bg-ai-bg"
        iconClass="bg-surface text-ai-fg"
        icon={<CircleUser className="h-5 w-5" aria-hidden />}
        title={t("toneTitle")}
        body={t("toneBody")}
      />
    </div>
  );
}

function PromiseCard({
  cardClass,
  iconClass,
  icon,
  title,
  body,
}: {
  cardClass: string;
  iconClass: string;
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <article
      className={`flex flex-col gap-2.5 rounded-2xl border p-4 ${cardClass}`}
    >
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${iconClass}`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="font-display text-sm font-bold text-foreground sm:text-[15px]">
          {title}
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-foreground/80 sm:text-[13px]">
          {body}
        </p>
      </div>
    </article>
  );
}
