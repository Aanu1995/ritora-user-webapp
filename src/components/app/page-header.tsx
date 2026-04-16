"use client";

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-background pb-4 pt-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>
    </div>
  );
}
