# Ritora User Web App

Ritora's frontend is a Next.js App Router application for authenticated skincare planning and product management. It works with the NestJS API in `../ritora-backend-app`.

## Current product areas

- Authentication: register, login, resend verification, forgot password, reset password, session-aware logout flows
- Onboarding: gated post-login flow that routes new users into skin profile setup
- Skin profile: create, edit, and review profile data used by the rest of the workspace
- Schedule: daily and weekly routine planning with slot editing, routine steps, and shelf product selection
- Shelf: photo-first product intake, product detail pages, edit flows, product-image upload, status updates, and bulk actions
- Settings and preferences: language, theme, plain-language mode, and account/session views
- Localization: English and Swedish via `next-intl`

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Radix UI primitives
- TanStack Query
- Zustand
- Jest + Testing Library
- Playwright

## Prerequisites

- Node.js `>=20`
- npm `>=10`
- The backend API running from `../ritora-backend-app`

## Environment

Create `/.env.local` from `/.env.example`:

```bash
cp .env.example .env.local
```

Variables:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPPORT_EMAIL=support@getritora.com
NEXT_PUBLIC_PRODUCT_MEDIA_URL=
```

Notes:

- `NEXT_PUBLIC_API_URL` must point to the backend API, not the Next.js dev server.
- `NEXT_PUBLIC_SUPPORT_EMAIL` is used for support links in public legal and account-deletion screens.
- `NEXT_PUBLIC_PRODUCT_MEDIA_URL` is optional. Set it when product images are served from private CloudFront media URLs.
- The frontend blocks unexpected API origins and insecure production API transport.

## Local development

1. Install dependencies.

```bash
npm install
```

2. Start the backend.

```bash
cd ../ritora-backend-app
npm install
npm run migration:run
npm run start:dev
```

3. Start the frontend.

```bash
cd ../ritora-user-webapp
npm run dev
```

4. Open `http://localhost:3000`.

Email verification and reset flows depend on the backend mail setup. In local development, the backend logs fallback links when mail delivery is not configured or fails.

## Routes

Public routes:

- `/`
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/reset-password/[token]`
- `/verify-email`
- `/verify-email/[token]`
- `/resend-verification`
- `/privacy`
- `/terms`
- `/cookies`

Protected routes:

- `/dashboard`
- `/onboarding`
- `/skin-profile`
- `/schedule`
- `/shelf`
- `/shelf/new`
- `/shelf/[productId]`
- `/shelf/[productId]/edit`
- `/settings`

## Shelf product flow

- Add Product is photo-first: users upload one product photo plus additional label photos.
- The frontend sends ordered multipart images plus the selected hero image index to the backend.
- Search and barcode are no longer part of the add-product UI.
- Edit Product supports separate choose/preview/upload behavior for product photos.

## Auth and security notes

- Access tokens are kept in memory.
- Refresh uses the backend's HTTP-only cookie.
- Auth-sensitive routes hydrate from `/auth/refresh` and `/auth/me`.
- Verification and reset pages send `Referrer-Policy: no-referrer` and `Cache-Control: no-store`.
- The app ships security headers and a report-only CSP from `next.config.ts`.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run test:watch
npm run test:cov
npm run test:e2e
```

Playwright examples:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e
PLAYWRIGHT_PORT=3010 npm run test:e2e
```

## Useful folders

- `src/app` - App Router routes and layouts
- `src/components` - shared UI and feature components
- `src/hooks` - feature hooks and query wiring
- `src/lib` - API client, date/time helpers, form helpers, and utilities
- `src/services` - API service wrappers
- `src/stores` - auth and UI state
- `src/types` - shared frontend types
- `messages` - translation files
- `e2e` - Playwright specs

## Related repo

Backend API: `../ritora-backend-app`
