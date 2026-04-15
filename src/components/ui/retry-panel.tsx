'use client';

import { Button } from '@/components/ui/button';

interface RetryPanelProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

export function RetryPanel({
  title,
  description,
  actionLabel,
  onAction,
}: RetryPanelProps) {
  return (
    <section className="rounded-4xl border border-danger/30 bg-danger/5 p-6 shadow-soft">
      <h2 className="font-display text-2xl tracking-tight text-foreground">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-danger">{description}</p>
      <Button type="button" variant="outline" className="mt-4" onClick={onAction}>
        {actionLabel}
      </Button>
    </section>
  );
}
