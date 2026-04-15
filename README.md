# Ritora User Web App

Ritora's frontend is a Next.js App Router application for account creation, secure sign-in, guided onboarding, skin profile setup, and the authenticated skincare workspace. It is paired with the NestJS API in the sibling repo at `../ritora-backend-app`.

## Current product scope

- Email/password authentication with mandatory email verification before a user can log in
- Resend verification, forgot password, and reset password flows
- Guided onboarding that routes users into skin profile setup
- Skin profile capture and editing
- Authenticated dashboard shell with sidebar navigation
- Settings for language, theme, and plain-language mode
- English and Swedish copy via `next-intl`
- Shared shadcn-style UI primitives built on Radix

The dashboard shell already reserves product areas from the blueprint such as inventory, routines, progress, and gap analysis, but those modules are still staged rather than fully implemented.

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Radix UI primitives with shadcn-style wrappers
- TanStack Query for server state
- Zustand for auth state
- `next-intl` for localization
- Jest + Testing Library for component and logic tests
- Playwright for end-to-end desktop and mobile coverage

## Prerequisites

- Node.js `>=20`
- npm `>=10`
- The backend API running locally, usually from `../ritora-backend-app`

## Environment

Create `/.env.local` from `/.env.example`:

```bash
cp .env.example .env.local
```

Current variables:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Notes:

- `NEXT_PUBLIC_API_URL` must point to the backend API, not the Next.js dev server.
- If the frontend accidentally points to itself during development, the app warns about the misconfiguration and clears auth state instead of looping on refresh.

## Local development

1. Install dependencies.

```bash
npm install
```

2. Start the backend in the sibling repo.

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

If you want to exercise email verification or password reset locally, the backend defaults to Mailpit:

- SMTP listener: `localhost:1025`
- Mail UI: `http://localhost:8025`

## Key routes

Public routes:

- `/`
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/verify-email`
- `/resend-verification`
- `/privacy`
- `/terms`
- `/cookies`

Protected routes:

- `/onboarding`
- `/dashboard`
- `/skin-profile`
- `/settings`

## Auth and security notes

- Users can register without becoming authenticated immediately.
- Login is blocked until `emailVerified` is true.
- Verification and password-reset links use `#token=...` URL fragments, so the token is not sent to the server as a query string.
- Sensitive auth pages send `Referrer-Policy: no-referrer` and `Cache-Control: no-store`.
- Access tokens are kept in memory and refreshed with the backend's HTTP-only refresh cookie.
- Theme preference is bootstrapped before hydration so the app paints directly in the active theme instead of flashing light mode first.

## Testing and quality checks

Available scripts:

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

Coverage thresholds enforced in Jest:

- Lines: `80%`
- Functions: `80%`

Playwright details:

- Runs desktop Chrome and mobile Chrome projects
- Builds and serves the app automatically unless `PLAYWRIGHT_BASE_URL` is provided
- Optional overrides:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e
PLAYWRIGHT_PORT=3010 npm run test:e2e
```

## Useful folders

- `src/app` - App Router pages and layouts
- `src/components` - shared UI and product components
- `src/hooks` - auth, skin profile, and utility hooks
- `src/lib` - API client, theme bootstrap, routing helpers, and utilities
- `src/services` - HTTP service wrappers for backend endpoints
- `src/stores` - client state stores
- `messages` - translation files
- `e2e` - Playwright specs

## Related repo

Backend API: `../ritora-backend-app`
