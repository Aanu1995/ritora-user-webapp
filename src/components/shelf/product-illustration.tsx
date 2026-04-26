import { ProductCategory } from '@/types/shelf';

type Props = {
  category: ProductCategory;
  brand: string;
  className?: string;
};

/**
 * Lightweight SVG placeholder for products without a real image. Each category
 * gets a distinct silhouette so the grid stays readable even when every card
 * is a placeholder.
 */
export function ProductIllustration({ category, brand, className }: Props) {
  const initials = brand
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .filter(Boolean)
    .join('');

  return (
    <svg
      viewBox="0 0 120 160"
      className={className}
      role="img"
      aria-label={`${brand} placeholder`}
    >
      {renderSilhouette(category)}
      <text
        x="60"
        y="88"
        textAnchor="middle"
        fontSize="14"
        fontWeight="700"
        fill="#14201a"
        fillOpacity="0.28"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {initials}
      </text>
    </svg>
  );
}

function renderSilhouette(category: ProductCategory) {
  switch (category) {
    case ProductCategory.Serum:
      return (
        <g>
          <rect x="30" y="20" width="60" height="20" rx="4" fill="#c8c2b3" />
          <rect x="34" y="40" width="52" height="110" rx="10" fill="#a7d4b8" />
        </g>
      );
    case ProductCategory.SunProtection:
      return (
        <g>
          <rect x="30" y="30" width="60" height="124" rx="8" fill="#f2c08a" />
          <rect x="42" y="20" width="36" height="16" rx="3" fill="#d99e58" />
        </g>
      );
    case ProductCategory.Cleanser:
      return (
        <g>
          <rect x="32" y="30" width="56" height="124" rx="12" fill="#e8dfcb" />
          <rect x="44" y="20" width="32" height="18" rx="4" fill="#c8c2b3" />
        </g>
      );
    case ProductCategory.Toner:
      return (
        <g>
          <rect x="32" y="24" width="56" height="132" rx="8" fill="#c8c2b3" />
          <rect x="28" y="18" width="64" height="10" rx="3" fill="#a39986" />
        </g>
      );
    case ProductCategory.Moisturizer:
      return (
        <g>
          <rect x="26" y="40" width="68" height="44" rx="10" fill="#d6e9dc" />
          <rect x="30" y="84" width="60" height="70" rx="10" fill="#a7d4b8" />
        </g>
      );
    case ProductCategory.Essence:
      return (
        <g>
          <rect x="36" y="18" width="48" height="16" rx="3" fill="#a39986" />
          <rect x="30" y="34" width="60" height="120" rx="8" fill="#dfe6df" />
        </g>
      );
    case ProductCategory.Mask:
      return (
        <g>
          <rect x="28" y="28" width="64" height="120" rx="32" fill="#f2d5c3" />
        </g>
      );
    case ProductCategory.EyeCare:
      return (
        <g>
          <ellipse cx="60" cy="88" rx="42" ry="44" fill="#efe5d0" />
          <ellipse cx="60" cy="88" rx="34" ry="36" fill="#fbf7ef" />
        </g>
      );
    case ProductCategory.LipCare:
      return (
        <g>
          <rect x="44" y="24" width="32" height="120" rx="8" fill="#d6b0b0" />
        </g>
      );
    case ProductCategory.Exfoliant:
      return (
        <g>
          <rect x="32" y="24" width="56" height="132" rx="10" fill="#efc9b4" />
        </g>
      );
    case ProductCategory.Treatment:
      return (
        <g>
          <rect x="38" y="20" width="44" height="130" rx="8" fill="#c3c9d6" />
        </g>
      );
    default:
      return <rect x="32" y="24" width="56" height="130" rx="10" fill="#d6d6d6" />;
  }
}
