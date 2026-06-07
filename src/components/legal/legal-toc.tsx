'use client';

import { useEffect, useState } from 'react';

interface LegalTocProps {
  label: string;
  items: ReadonlyArray<{ id: string; label: string }>;
}

export function LegalToc({ label, items }: LegalTocProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? '');

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }
    const sectionEls = items
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sectionEls.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top);
        if (visible.length) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: 0 },
    );

    sectionEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label={label} className="text-sm">
      <p className="px-3 pb-3 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
        {label}
      </p>
      <ol className="space-y-0.5">
        {items.map(({ id, label: itemLabel }, idx) => {
          const isActive = activeId === id;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-current={isActive ? 'true' : undefined}
                className={`group flex items-start gap-3 rounded-lg border-l-2 py-1.5 pr-2 pl-3 leading-snug transition-colors ${
                  isActive
                    ? 'border-accent bg-accent-soft/45 text-foreground'
                    : 'border-transparent text-muted hover:bg-surface-muted/60 hover:text-foreground'
                }`}
              >
                <span
                  className={`text-[11px] font-semibold tabular-nums transition-colors ${
                    isActive
                      ? 'text-accent-strong'
                      : 'text-muted/60 group-hover:text-muted'
                  }`}
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="flex-1">{itemLabel}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
