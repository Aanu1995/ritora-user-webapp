import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ProductPageHeaderProps = {
  leading?: ReactNode;
  title?: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  actionClassName?: string;
};

export function ProductPageHeader({
  leading,
  title,
  subtitle,
  actions,
  actionClassName,
}: ProductPageHeaderProps) {
  return (
    <div className="sticky top-0 z-10 -mx-4 bg-background/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex items-center gap-3">
        {leading ? <div className="shrink-0">{leading}</div> : null}

        {title ? (
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-0.5 truncate text-xs text-muted sm:text-sm">
                {subtitle}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {actions ? (
          <div className={cn('shrink-0', actionClassName)}>{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
