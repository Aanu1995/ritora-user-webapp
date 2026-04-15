import type { SVGProps } from 'react';

export function IngredientCheckIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 480 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby="ingredient-check-title"
      {...props}
    >
      <title id="ingredient-check-title">
        An ingredient safety checklist with green ticks and a warning flag
      </title>
      <defs>
        <linearGradient id="check-bg" x1="0" y1="0" x2="480" y2="320" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--color-secondary-glow)" />
          <stop offset="100%" stopColor="var(--color-accent-glow)" />
        </linearGradient>
      </defs>

      <rect width="480" height="320" rx="28" fill="url(#check-bg)" />

      {/* Background leaves */}
      <g opacity="0.5">
        <path
          d="M36 80 Q18 52 46 26 Q72 58 64 96 Q46 114 36 80 Z"
          fill="var(--color-accent)"
          opacity="0.32"
        />
        <path
          d="M46 26 Q54 62 64 96"
          stroke="var(--color-accent-strong)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M416 272 Q440 250 432 218 Q404 230 396 264 Q400 288 416 272 Z"
          fill="var(--color-accent)"
          opacity="0.28"
        />
      </g>

      {/* Clipboard */}
      <g>
        <rect
          x="96"
          y="52"
          width="288"
          height="240"
          rx="16"
          fill="var(--color-surface)"
          stroke="var(--color-border)"
          strokeWidth="1.5"
        />
        {/* Top clip */}
        <rect x="196" y="40" width="88" height="24" rx="6" fill="var(--color-foreground)" opacity="0.88" />
        <rect x="206" y="44" width="68" height="4" rx="2" fill="var(--color-background)" opacity="0.35" />

        {/* Header */}
        <rect x="120" y="82" width="132" height="8" rx="4" fill="var(--color-accent-strong)" />
        <rect x="120" y="98" width="180" height="4" rx="2" fill="var(--color-muted)" />

        {/* Row 1 — safe */}
        <g>
          <circle cx="132" cy="138" r="11" fill="var(--color-accent)" opacity="0.22" />
          <path
            d="M126 138 l5 5 l8 -10"
            stroke="var(--color-accent-strong)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <rect x="152" y="130" width="124" height="5" rx="2.5" fill="var(--color-foreground)" opacity="0.82" />
          <rect x="152" y="142" width="88" height="4" rx="2" fill="var(--color-muted)" />
        </g>

        {/* Row 2 — safe */}
        <g>
          <circle cx="132" cy="178" r="11" fill="var(--color-accent)" opacity="0.22" />
          <path
            d="M126 178 l5 5 l8 -10"
            stroke="var(--color-accent-strong)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <rect x="152" y="170" width="144" height="5" rx="2.5" fill="var(--color-foreground)" opacity="0.82" />
          <rect x="152" y="182" width="104" height="4" rx="2" fill="var(--color-muted)" />
        </g>

        {/* Row 3 — warning */}
        <g>
          <circle cx="132" cy="218" r="11" fill="#b8540a" opacity="0.22" />
          <path
            d="M132 212 l0 7 M132 224 l0 0.5"
            stroke="#b8540a"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <rect x="152" y="210" width="116" height="5" rx="2.5" fill="var(--color-foreground)" opacity="0.82" />
          <rect x="152" y="222" width="132" height="4" rx="2" fill="#b8540a" opacity="0.7" />
        </g>

        {/* Row 4 — safe */}
        <g>
          <circle cx="132" cy="258" r="11" fill="var(--color-accent)" opacity="0.22" />
          <path
            d="M126 258 l5 5 l8 -10"
            stroke="var(--color-accent-strong)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <rect x="152" y="250" width="100" height="5" rx="2.5" fill="var(--color-foreground)" opacity="0.82" />
          <rect x="152" y="262" width="120" height="4" rx="2" fill="var(--color-muted)" />
        </g>
      </g>

      {/* Floating shield badge */}
      <g transform="translate(360 80)">
        <circle r="40" fill="var(--color-accent-glow)" />
        <path
          d="M0 -22 L18 -12 L18 8 Q18 22 0 32 Q-18 22 -18 8 L-18 -12 Z"
          fill="var(--color-accent-strong)"
        />
        <path
          d="M-8 2 L-2 8 L10 -6"
          stroke="var(--color-surface)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      {/* Sparkles */}
      <g fill="var(--color-accent-strong)">
        <path d="M72 200 l1.6 4 l4 1.6 l-4 1.6 l-1.6 4 l-1.6 -4 l-4 -1.6 l4 -1.6 Z" opacity="0.8" />
        <path d="M420 160 l1.2 3.2 l3.2 1.2 l-3.2 1.2 l-1.2 3.2 l-1.2 -3.2 l-3.2 -1.2 l3.2 -1.2 Z" opacity="0.7" />
      </g>
    </svg>
  );
}
