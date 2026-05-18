import styles from './landing.module.css';

type BottleShape = 'pump' | 'dropper' | 'tube' | 'jar';
type BottleTone =
  | 'green'
  | 'blush'
  | 'cream'
  | 'lavender'
  | 'aqua'
  | 'amber'
  | 'charcoal';
type BottleSize = 'sm' | 'md' | 'lg';

interface ProductBottleProps {
  shape: BottleShape;
  tone: BottleTone;
  brand: string;
  brandSub?: string;
  size?: BottleSize;
  className?: string;
  style?: React.CSSProperties;
}

export function ProductBottle({
  shape,
  tone,
  brand,
  brandSub,
  size = 'sm',
  className,
  style,
}: ProductBottleProps) {
  return (
    <div
      className={`${styles.bottle}${className ? ` ${className}` : ''}`}
      data-shape={shape}
      data-tone={tone}
      data-size={size}
      style={style}
      aria-hidden="true"
    >
      <span className={styles.bottleBody} />
      <span className={styles.bottleCap} />
      {(shape === 'pump' || shape === 'dropper') && (
        <span className={styles.bottleNeck} />
      )}
      <span className={styles.bottleLabel} />
      <span className={styles.bottleBrand}>
        {brand}
        {brandSub ? <span className={styles.bottleBrandSub}>{brandSub}</span> : null}
      </span>
      <span className={styles.bottleShine} />
    </div>
  );
}
