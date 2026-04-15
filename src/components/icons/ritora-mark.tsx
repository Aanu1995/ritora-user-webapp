import type { SVGProps } from 'react';

export function RitoraMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient id="ritora-mark-gradient" x1="8" y1="4" x2="32" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <path
        d="M20 3.5c-1.1 0-2 .9-2 2 0 2.2-3 5.9-5.5 9.2C10 18 7.5 21.8 7.5 25.2 7.5 32.1 13.1 37 20 37s12.5-4.9 12.5-11.8c0-3.4-2.5-7.2-5-10.5C25 11.4 22 7.7 22 5.5c0-1.1-.9-2-2-2Z"
        fill="url(#ritora-mark-gradient)"
      />
      <path
        d="M13.2 25.6c0 4 3.1 7.1 6.8 7.1"
        stroke="#fbf7ef"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeOpacity="0.85"
      />
      <circle cx="15.5" cy="21.5" r="1.4" fill="#fbf7ef" fillOpacity="0.85" />
    </svg>
  );
}
