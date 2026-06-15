import type { ComponentProps } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:pointer-events-none disabled:translate-y-0 disabled:!border-border disabled:!bg-surface-muted disabled:!text-muted disabled:!shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-foreground text-background shadow-soft hover:-translate-y-0.5 hover:opacity-95',
        outline:
          'border border-[color:var(--border-strong)] bg-surface text-foreground hover:bg-accent-soft hover:text-accent-strong',
        secondary:
          'bg-accent-soft text-accent-strong hover:bg-accent-soft/80',
        ghost: 'text-foreground hover:bg-accent/5',
        link: 'rounded-none px-0 py-0 text-accent-strong shadow-none hover:underline',
      },
      size: {
        sm: 'h-7 px-2.5 text-[11px] sm:h-9 sm:px-4 sm:text-sm',
        md: 'h-9 px-3.5 text-xs sm:h-11 sm:px-5 sm:text-sm',
        lg: 'h-10 px-4 text-sm sm:h-[3.25rem] sm:px-7 sm:text-base',
        xl: 'h-11 px-5 text-sm sm:h-[3.75rem] sm:px-9 sm:text-base',
        icon: 'h-9 w-9 sm:h-11 sm:w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
