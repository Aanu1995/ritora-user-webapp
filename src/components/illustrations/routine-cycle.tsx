import type { SVGProps } from 'react';

export function RoutineCycleIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 480 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby="routine-cycle-title"
      {...props}
    >
      <title id="routine-cycle-title">
        A daily routine cycle that runs from morning sun to evening moon with the shelf at the centre
      </title>
      <defs>
        <linearGradient id="routine-bg" x1="0" y1="0" x2="480" y2="320" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--color-accent-glow)" />
          <stop offset="100%" stopColor="var(--color-secondary-glow)" />
        </linearGradient>
      </defs>

      <rect width="480" height="320" rx="28" fill="url(#routine-bg)" />

      {/* Big cycle ring */}
      <circle
        cx="240"
        cy="160"
        r="104"
        stroke="var(--color-accent-strong)"
        strokeWidth="2"
        strokeDasharray="6 8"
        opacity="0.55"
        fill="none"
      />

      {/* Center card — "Your shelf" */}
      <g>
        <rect
          x="180"
          y="116"
          width="120"
          height="88"
          rx="14"
          fill="var(--color-surface)"
          stroke="var(--color-border)"
          strokeWidth="1.5"
        />
        <rect x="196" y="134" width="48" height="5" rx="2.5" fill="var(--color-accent-strong)" />
        <rect x="196" y="146" width="88" height="3" rx="1.5" fill="var(--color-muted)" />
        <rect x="196" y="156" width="68" height="3" rx="1.5" fill="var(--color-muted)" />
        <rect x="196" y="172" width="32" height="16" rx="4" fill="var(--color-accent)" opacity="0.25" />
        <rect x="236" y="172" width="48" height="16" rx="4" fill="var(--color-accent)" opacity="0.15" />
      </g>

      {/* AM node — sun */}
      <g transform="translate(104 160)">
        <circle r="38" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1.5" />
        <circle r="16" fill="var(--color-accent)" opacity="0.25" />
        <circle r="10" fill="var(--color-accent-strong)" />
        <g stroke="var(--color-accent-strong)" strokeWidth="2" strokeLinecap="round">
          <line x1="0" y1="-22" x2="0" y2="-28" />
          <line x1="0" y1="22" x2="0" y2="28" />
          <line x1="-22" y1="0" x2="-28" y2="0" />
          <line x1="22" y1="0" x2="28" y2="0" />
          <line x1="-15" y1="-15" x2="-20" y2="-20" />
          <line x1="15" y1="15" x2="20" y2="20" />
          <line x1="-15" y1="15" x2="-20" y2="20" />
          <line x1="15" y1="-15" x2="20" y2="-20" />
        </g>
      </g>

      {/* PM node — moon */}
      <g transform="translate(376 160)">
        <circle r="38" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1.5" />
        <path
          d="M-6 -16 A 18 18 0 1 0 8 18 A 14 14 0 1 1 -6 -16 Z"
          fill="var(--color-accent-strong)"
        />
        <circle cx="14" cy="-12" r="1.5" fill="var(--color-accent)" />
        <circle cx="18" cy="4" r="1.2" fill="var(--color-accent)" opacity="0.7" />
        <circle cx="-16" cy="-18" r="1" fill="var(--color-accent)" opacity="0.6" />
      </g>

      {/* AM → center arrow */}
      <g>
        <path
          d="M148 150 Q168 132 188 130"
          stroke="var(--color-accent-strong)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M184 126 L192 130 L184 134"
          stroke="var(--color-accent-strong)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      {/* center → PM arrow */}
      <g>
        <path
          d="M296 200 Q320 214 336 178"
          stroke="var(--color-accent-strong)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M336 182 L336 174 L344 176"
          stroke="var(--color-accent-strong)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      {/* PM → AM (night to next morning) arrow */}
      <g>
        <path
          d="M376 212 Q240 300 104 212"
          stroke="var(--color-accent-strong)"
          strokeWidth="2"
          strokeDasharray="4 6"
          strokeLinecap="round"
          opacity="0.6"
          fill="none"
        />
      </g>

      {/* AM label */}
      <g transform="translate(104 226)">
        <rect x="-22" y="0" width="44" height="20" rx="10" fill="var(--color-foreground)" />
        <text
          x="0"
          y="14"
          textAnchor="middle"
          fill="var(--color-background)"
          fontSize="11"
          fontWeight="600"
          fontFamily="var(--font-sans, sans-serif)"
        >
          AM
        </text>
      </g>

      {/* PM label */}
      <g transform="translate(376 226)">
        <rect x="-22" y="0" width="44" height="20" rx="10" fill="var(--color-foreground)" />
        <text
          x="0"
          y="14"
          textAnchor="middle"
          fill="var(--color-background)"
          fontSize="11"
          fontWeight="600"
          fontFamily="var(--font-sans, sans-serif)"
        >
          PM
        </text>
      </g>

      {/* Decorative leaf left bottom */}
      <path
        d="M34 268 Q20 240 42 220 Q64 240 58 272 Q46 286 34 268 Z"
        fill="var(--color-accent)"
        opacity="0.3"
      />
      <path
        d="M42 220 Q50 248 58 272"
        stroke="var(--color-accent-strong)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Small sparkle top */}
      <path
        d="M240 42 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 Z"
        fill="var(--color-accent-strong)"
        opacity="0.8"
      />
    </svg>
  );
}
