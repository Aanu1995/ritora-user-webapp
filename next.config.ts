import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const apiOrigin = new URL(
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1',
).origin;
const apiOriginUrl = new URL(apiOrigin);
const productMediaUrl = process.env.NEXT_PUBLIC_PRODUCT_MEDIA_URL?.trim() || '';
const productMediaOriginUrl = productMediaUrl
  ? new URL(productMediaUrl)
  : null;
const scriptSrc =
  process.env.NODE_ENV === 'development'
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";

const cspReportOnly = [
  "default-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  `img-src 'self' data: blob: https: ${apiOrigin}`,
  "font-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline'",
  scriptSrc,
  `connect-src 'self' ${apiOrigin}`,
].join('; ');

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: apiOriginUrl.protocol.replace(':', '') as 'http' | 'https',
        hostname: apiOriginUrl.hostname,
        port: apiOriginUrl.port || undefined,
        pathname: '/media/**',
      },
      ...(productMediaOriginUrl
        ? [
            {
              protocol: productMediaOriginUrl.protocol.replace(':', '') as
                | 'http'
                | 'https',
              hostname: productMediaOriginUrl.hostname,
              port: productMediaOriginUrl.port || undefined,
              pathname: '/product-images/**',
            },
          ]
        : []),
    ],
  },
  async headers() {
    return [
      {
        source: '/verify-email',
        headers: [
          {
            key: 'Referrer-Policy',
            value: 'no-referrer',
          },
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
      {
        source: '/reset-password',
        headers: [
          {
            key: 'Referrer-Policy',
            value: 'no-referrer',
          },
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy-Report-Only',
            value: cspReportOnly,
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-site',
          },
          {
            key: 'Permissions-Policy',
            value:
              'camera=(self), geolocation=(), microphone=(), payment=(), usb=()',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
