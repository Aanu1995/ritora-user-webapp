import Image, { type StaticImageData } from 'next/image';

type BaseProps = {
  src: StaticImageData;
  sizes: string;
  priority?: boolean;
  className?: string;
  reveal?: 'none' | 'fade-up' | 'fade-up-delay-1' | 'fade-up-delay-2';
};

type MeaningfulProps = BaseProps & {
  meaningful: true;
  alt: string;
  decorative?: never;
};

type DecorativeProps = BaseProps & {
  decorative: true;
  meaningful?: never;
  alt?: never;
};

export type LandingImageProps = MeaningfulProps | DecorativeProps;

const revealClass: Record<NonNullable<BaseProps['reveal']>, string> = {
  none: '',
  'fade-up': 'animate-fade-up',
  'fade-up-delay-1': 'animate-fade-up-delay-1',
  'fade-up-delay-2': 'animate-fade-up-delay-2',
};

export function LandingImage(props: LandingImageProps) {
  const { src, sizes, priority = false, className = '', reveal = 'none' } = props;
  const isDecorative = 'decorative' in props && props.decorative;
  const alt = isDecorative ? '' : (props as MeaningfulProps).alt;

  return (
    <div
      className={[
        'relative overflow-hidden rounded-3xl border border-border bg-surface-muted shadow-soft ring-1 ring-border/60',
        revealClass[reveal],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Image
        src={src}
        alt={alt}
        sizes={sizes}
        placeholder="blur"
        priority={priority}
        fetchPriority={priority ? 'high' : 'auto'}
        role={isDecorative ? 'presentation' : undefined}
        aria-hidden={isDecorative || undefined}
        className="h-full w-full object-cover dark:brightness-[0.92] dark:contrast-[1.02]"
      />
    </div>
  );
}
