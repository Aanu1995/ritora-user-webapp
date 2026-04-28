import type { SVGProps } from 'react';

type IllustrationProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

export function HeroShelfIllustration({
  title,
  ...props
}: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 520 440"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id="hero-bg-gradient" x1="0" y1="0" x2="520" y2="440" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--color-accent-glow)" />
          <stop offset="100%" stopColor="var(--color-secondary-glow)" />
        </linearGradient>
        <linearGradient id="hero-bottle-a" x1="0" y1="120" x2="0" y2="340" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--color-surface)" />
          <stop offset="100%" stopColor="var(--color-background)" />
        </linearGradient>
        <linearGradient id="hero-bottle-b" x1="0" y1="170" x2="0" y2="340" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--color-accent-strong)" />
          <stop offset="100%" stopColor="var(--color-accent)" />
        </linearGradient>
        <linearGradient id="hero-bottle-c" x1="0" y1="160" x2="0" y2="340" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--color-surface)" />
          <stop offset="100%" stopColor="#efe3d0" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="520" height="440" rx="32" fill="url(#hero-bg-gradient)" />

      {/* Soft sun disc */}
      <circle cx="420" cy="110" r="72" fill="var(--color-accent-glow)" opacity="0.65" />
      <circle cx="420" cy="110" r="46" fill="var(--color-accent-glow)" opacity="0.9" />

      {/* Background leaves */}
      <g opacity="0.55">
        <path
          d="M64 96 Q46 60 84 34 Q112 70 98 110 Q82 134 64 96 Z"
          fill="var(--color-accent)"
          opacity="0.35"
        />
        <path
          d="M84 34 Q90 68 98 110"
          stroke="var(--color-accent-strong)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M470 310 Q500 278 480 236 Q442 252 432 298 Q438 330 470 310 Z"
          fill="var(--color-accent)"
          opacity="0.3"
        />
        <path
          d="M480 236 Q462 272 432 298"
          stroke="var(--color-accent-strong)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>

      {/* Shelf plate */}
      <rect x="48" y="338" width="424" height="14" rx="7" fill="var(--color-foreground)" opacity="0.12" />
      <rect x="48" y="338" width="424" height="5" rx="2.5" fill="var(--color-foreground)" opacity="0.18" />

      {/* Bottle A — tall serum / dropper */}
      <g>
        {/* Shadow */}
        <ellipse cx="130" cy="344" rx="52" ry="5" fill="var(--color-foreground)" opacity="0.12" />
        {/* Body */}
        <rect
          x="94"
          y="170"
          width="72"
          height="168"
          rx="14"
          fill="url(#hero-bottle-a)"
          stroke="var(--color-border)"
          strokeWidth="1.5"
        />
        {/* Label */}
        <rect x="104" y="218" width="52" height="74" rx="6" fill="var(--color-accent)" opacity="0.18" />
        <rect x="110" y="232" width="40" height="4" rx="2" fill="var(--color-accent-strong)" />
        <rect x="110" y="244" width="32" height="3" rx="1.5" fill="var(--color-accent-strong)" opacity="0.7" />
        <rect x="110" y="254" width="36" height="3" rx="1.5" fill="var(--color-accent-strong)" opacity="0.7" />
        <rect x="110" y="272" width="22" height="4" rx="2" fill="var(--color-accent-strong)" />
        {/* Neck */}
        <rect x="112" y="150" width="36" height="24" rx="4" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1.5" />
        {/* Dropper cap */}
        <rect x="118" y="118" width="24" height="34" rx="5" fill="var(--color-accent-strong)" />
        <rect x="122" y="108" width="16" height="14" rx="3" fill="var(--color-accent)" />
      </g>

      {/* Bottle B — wide moisturizer jar */}
      <g>
        <ellipse cx="260" cy="344" rx="66" ry="5" fill="var(--color-foreground)" opacity="0.14" />
        {/* Body */}
        <rect
          x="200"
          y="210"
          width="120"
          height="128"
          rx="16"
          fill="url(#hero-bottle-b)"
          stroke="var(--color-border)"
          strokeWidth="1.5"
        />
        {/* Glossy highlight */}
        <path
          d="M212 226 Q216 220 224 220 L232 220 Q220 260 232 318 Q224 322 216 322 Q206 280 212 226 Z"
          fill="var(--color-surface)"
          opacity="0.22"
        />
        {/* Label card */}
        <rect x="218" y="248" width="84" height="58" rx="8" fill="var(--color-surface)" />
        <rect x="230" y="262" width="40" height="4" rx="2" fill="var(--color-accent-strong)" />
        <rect x="230" y="274" width="60" height="3" rx="1.5" fill="var(--color-muted)" />
        <rect x="230" y="284" width="52" height="3" rx="1.5" fill="var(--color-muted)" />
        <circle cx="288" cy="278" r="7" fill="var(--color-accent)" opacity="0.22" />
        <path
          d="M284 278 l3 3 l6 -6"
          stroke="var(--color-accent-strong)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Lid */}
        <rect x="194" y="186" width="132" height="28" rx="8" fill="var(--color-foreground)" opacity="0.85" />
        <rect x="198" y="190" width="124" height="4" rx="2" fill="var(--color-surface)" opacity="0.35" />
      </g>

      {/* Bottle C — cleanser pump */}
      <g>
        <ellipse cx="390" cy="344" rx="48" ry="5" fill="var(--color-foreground)" opacity="0.12" />
        {/* Body */}
        <path
          d="M354 338 L354 200 Q354 186 368 186 L412 186 Q426 186 426 200 L426 338 Z"
          fill="url(#hero-bottle-c)"
          stroke="var(--color-border)"
          strokeWidth="1.5"
        />
        {/* Label */}
        <rect x="362" y="228" width="56" height="70" rx="6" fill="var(--color-secondary-glow)" opacity="0.9" />
        <rect x="370" y="244" width="40" height="4" rx="2" fill="#b4633b" />
        <rect x="370" y="256" width="32" height="3" rx="1.5" fill="#b4633b" opacity="0.7" />
        <rect x="370" y="266" width="36" height="3" rx="1.5" fill="#b4633b" opacity="0.7" />
        <rect x="370" y="282" width="22" height="4" rx="2" fill="#b4633b" />
        {/* Neck */}
        <rect x="378" y="166" width="24" height="22" rx="3" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1.5" />
        {/* Pump */}
        <path
          d="M388 132 Q372 132 372 148 Q372 160 388 162 L388 168 L378 168 L378 172 L402 172 L402 168 L392 168 L392 162 Q408 158 408 146 Q408 132 388 132 Z"
          fill="var(--color-foreground)"
          opacity="0.78"
        />
      </g>

      {/* Foreground leaf decorations */}
      <g opacity="0.9">
        <path
          d="M58 256 Q34 232 52 200 Q82 212 82 250 Q70 272 58 256 Z"
          fill="var(--color-accent)"
          opacity="0.42"
        />
        <path
          d="M52 200 Q66 222 82 250"
          stroke="var(--color-accent-strong)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M454 102 Q476 86 468 60"
          stroke="var(--color-accent-strong)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="454" cy="102" r="3.5" fill="var(--color-accent-strong)" />
        <circle cx="468" cy="60" r="3" fill="var(--color-accent-strong)" />
      </g>

      {/* Sparkle accents */}
      <g fill="var(--color-accent)">
        <path d="M148 92 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 Z" />
        <path d="M342 120 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5 l4 -1.5 Z" opacity="0.8" />
        <path d="M240 88 l1.2 3.2 l3.2 1.2 l-3.2 1.2 l-1.2 3.2 l-1.2 -3.2 l-3.2 -1.2 l3.2 -1.2 Z" opacity="0.7" />
      </g>
    </svg>
  );
}
