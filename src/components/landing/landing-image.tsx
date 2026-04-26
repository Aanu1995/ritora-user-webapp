import Image, { type StaticImageData } from 'next/image';

/**
 * LandingImage
 *
 * Shared visual treatment for every photo on the landing page. Centralising the
 * frame, border, shadow, and dark-mode tone correction here means individual
 * sections cannot drift out of sync.
 *
 * Accessibility rule (enforced by the discriminated union below):
 *   - `meaningful`: a descriptive `alt` string is required.
 *   - `decorative`: `alt` must be absent, the image renders with `alt=""` and
 *     `role="presentation"` so assistive tech skips it.
 *
 * Usage:
 *   <LandingImage meaningful src={heroShelf} alt={t('landing.hero.imageAlt')} … />
 *   <LandingImage decorative src={problemShelf} … />
 */

type BaseProps = {
  src: StaticImageData;
  sizes: string;
  priority?: boolean;
  /**
   * Extra classes applied to the outer frame (e.g. aspect ratio, max width).
   * The wrapper already provides rounded corners, border, shadow, and overflow.
   */
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
