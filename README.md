# Sample Sales Checkout

Internal review build for replacing the current Microsoft PowerApp sample-sale checkout flow with a full-stack Next.js application.

This repository is intended for engineering review. It is not just a UI prototype. The current state includes real local authentication, role-based access control, PostgreSQL persistence, configurable country behavior, receipt delivery via Mailjet, admin configuration surfaces, and a touch-first sell flow tuned for iPad/iPhone/laptop usage.

This branch also includes the current deployment baseline:

- Docker packaging
- runtime environment validation
- health endpoint
- structured application logging
- centralized API CORS and browser security headers
- stricter shared input-validation primitives and consistent validation error responses

## What This App Does

### Staff flow

- Sign in with local credentials
- Complete first-time user setup for country and language
- Search and browse catalog items
- Build a cart
- Confirm an external pinpad payment
- Create orders and order line items in PostgreSQL
- Email receipts
- View recent personal orders
- Correct a customer email and resend a receipt

### Admin / privileged flow

- Manage catalog items and per-country availability/price overrides
- Manage country settings, including legal labels, receipt footer, locale defaults, and company name
- Manage tax rules
- Manage receipt templates
- View all orders with support-level detail
- Manage users, roles, invites, resets, and account status
- Write audit entries for admin-side mutations

## Current Stack

- Frontend: Next.js App Router, React 19, TypeScript
- Styling: Tailwind CSS with local component primitives
- Data: PostgreSQL + Prisma
- Validation: Zod
- Auth: local email/password + cookie session
- Email: Mailjet-backed provider abstraction
- Rich text: Tiptap for email template editing

Package versions are in [package.json](/Users/anthony.lariccia/Library/CloudStorage/OneDrive-BESTSELLER/Documents/Projects/WebDev/SampleSale-POS/package.json).

## Architecture Summary

- Single deployable Next.js application for both staff and admin experiences
- PostgreSQL as system of record
- Prisma schema models orders, users, countries, templates, and audit logs
- Route handlers own mutations and server-side validation
- Country behavior is data-driven, not hardcoded into UI-only logic
- Receipt generation uses stored order snapshots so historical receipts remain stable after catalog or tax changes

Additional architecture detail:
- [docs/solution-architecture.md](/Users/anthony.lariccia/Library/CloudStorage/OneDrive-BESTSELLER/Documents/Projects/WebDev/SampleSale-POS/docs/solution-architecture.md)
- [docs/api-contract.md](/Users/anthony.lariccia/Library/CloudStorage/OneDrive-BESTSELLER/Documents/Projects/WebDev/SampleSale-POS/docs/api-contract.md)
- [docs/uat-checklist.md](/Users/anthony.lariccia/Library/CloudStorage/OneDrive-BESTSELLER/Documents/Projects/WebDev/SampleSale-POS/docs/uat-checklist.md)
- [prisma/schema.prisma](/Users/anthony.lariccia/Library/CloudStorage/OneDrive-BESTSELLER/Documents/Projects/WebDev/SampleSale-POS/prisma/schema.prisma)

## Current Role Model

- `STAFF`
  - sell, checkout, view personal order history, resend their own receipts
- `CATALOG_ADMIN`
  - admin access limited to catalog management
- `FINANCE`
  - admin access to view all orders
- `OPERATIONS`
  - catalog, order support, country settings, tax rules, email templates
- `FULL_ADMIN`
  - full access including users and roles

There is still temporary compatibility for legacy `ADMIN` records in the data model. That should be removed after the role migration is fully cleaned up.

## Current Country Assumptions

This implementation is now country-driven rather than state/province-driven in the staff flow.

- `CA`
  - Canada
  - business assumption: Quebec-style taxes
- `US`
  - United States
  - business assumption: no extra tax handling in current staff flow
- `AU`
  - Australia
  - GST included pricing

Company/legal entity display is now configurable per country in admin settings.

## Notable Production-Oriented Behavior Already In Place

- Passwords are hashed
- Password reset uses expiring, hashed, single-use tokens
- Mutating routes use server-side validation
- Shared validation primitives normalize and constrain emails, IDs, country codes, locales, currencies, SKUs, and tax categories
- Validation failures now return a consistent `400` shape with flattened field details
- Dynamic route params are validated on mutation/detail handlers
- Checkout no longer trusts client-supplied totals/prices
- Auth and reset endpoints have basic rate limiting
- Admin writes create audit entries
- Admin email preview is sandboxed
- Navigation is role-aware
- Staff sell flow is responsive and tuned for tablet/mobile use
- Sensitive auth/mail/env/logging modules are marked server-only
- Security headers are applied centrally in middleware

Security notes are documented in:
- [security_best_practices_report.md](/Users/anthony.lariccia/Library/CloudStorage/OneDrive-BESTSELLER/Documents/Projects/WebDev/SampleSale-POS/security_best_practices_report.md)

## Logging / Observability

The app now emits structured JSON logs to stdout/stderr through a shared logger:

- [src/lib/observability/logger.ts](/Users/anthony.lariccia/Library/CloudStorage/OneDrive-BESTSELLER/Documents/Projects/WebDev/SampleSale-POS/src/lib/observability/logger.ts)

Current behavior:

- consistent `debug` / `info` / `warn` / `error` levels
- JSON entries with timestamp, service name, environment, event name, and contextual fields
- request-scoped log context for key route handlers
- sensitive field redaction for common secrets/tokens/passwords/cookies/session values
- truncated oversized string payloads
- logs emitted to stdout/stderr so container platforms can collect them directly

Current coverage includes:

- login, registration, password reset request, password reset completion
- admin invite and user-management mail flows
- checkout receipt send failures
- receipt send attempts/results
- Mailjet send success/failure paths
- seed-time fatal failures

Environment variables:

- `LOG_LEVEL`
  - default: `info`
- `APP_LOG_SERVICE`
  - default: `sample-sales-app`

What still is not in place:

- centralized log aggregation/search
- tracing / span correlation across app boundaries
- metrics and alerting
- durable request IDs propagated through every route and downstream mail/send path

## Known Gaps / Review Focus

These are the main areas that still need engineering review or follow-up before calling this production-ready:

- Distributed rate limiting
  - current implementation is in-process only
- Session hardening per environment
  - production cookie flags and domain rules still need environment-specific validation
- CSRF strategy
  - current app relies on same-origin cookies and explicit CORS allowlisting
  - if a separate credentialed frontend is introduced, add CSRF tokens
- Observability
  - structured application logging now exists
  - centralized aggregation, metrics, tracing, and alerting do not
- Legacy cleanup
  - remove old `ADMIN` compatibility path
  - remove unused region/state data remnants from schema
- End-to-end deployment connectivity
  - `MONWEBDEV01` container-to-Postgres connectivity still needs to be defined clearly

## Local Setup

### Prerequisites

- Node.js 24 LTS is currently being used in this workspace
- PostgreSQL reachable from the local machine

### Environment file

Create `.env` from `.env.example` and set at minimum:

- `DATABASE_URL`
- `APP_URL`
- `CORS_ALLOWED_ORIGINS`
- `SESSION_SECRET`
- `MAIL_PROVIDER`
- `MAILJET_API_KEY`
- `MAILJET_API_SECRET`
- `MAIL_FROM`
- `LOG_LEVEL`
- `APP_LOG_SERVICE`

### Install and run

```bash
npm install --cache ./.npm-cache
npx prisma db push
npx prisma generate
npm run db:seed
npm run dev -- --hostname 0.0.0.0
```

### Seeded UAT users

The seed now creates test users for:

- `FULL_ADMIN`
- `STAFF`
- `CATALOG_ADMIN`
- `FINANCE`
- `OPERATIONS`

Default credentials:

- username: see [docs/uat-checklist.md](/Users/anthony.lariccia/Library/CloudStorage/OneDrive-BESTSELLER/Documents/Projects/WebDev/SampleSale-POS/docs/uat-checklist.md)
- password: `SEED_TEST_USER_PASSWORD`, or `SEED_ADMIN_PASSWORD`, or `ChangeMe123!`

### Notes about this workspace

- This machine required a local npm cache path because of ownership issues under `~/.npm`
- Mailjet is already wired in code, but credentials and sender validation must be correct in `.env`
- Container/runtime logs are expected to be consumed from stdout/stderr rather than a file sink

## Health / Runtime Diagnostics

The app now exposes:

- `GET /api/health`

Current checks:

- runtime environment validation
- PostgreSQL connectivity via Prisma

Behavior:

- returns `200` when env and database checks pass
- returns `503` when required env is missing/invalid or the database is unreachable
- intended for container health checks and deployment debugging, not public status reporting

Container health checks are now wired through:

- [Dockerfile](/Users/anthony.lariccia/Library/CloudStorage/OneDrive-BESTSELLER/Documents/Projects/WebDev/SampleSale-POS/Dockerfile)
- [docker-compose.yml](/Users/anthony.lariccia/Library/CloudStorage/OneDrive-BESTSELLER/Documents/Projects/WebDev/SampleSale-POS/docker-compose.yml)

## CORS

API CORS is now handled centrally in:

- [middleware.ts](/Users/anthony.lariccia/Library/CloudStorage/OneDrive-BESTSELLER/Documents/Projects/WebDev/SampleSale-POS/middleware.ts)

Behavior:

- applies only to `/api/*`
- supports preflight `OPTIONS`
- allows credentials
- uses explicit origin allowlisting, never `*`

Allowed origins are built from:

- `APP_URL`
- `CORS_ALLOWED_ORIGINS`
  - comma-separated list for additional allowed front-end/server origins

## Security Headers

Browser security headers are now enforced centrally in:

- [middleware.ts](/Users/anthony.lariccia/Library/CloudStorage/OneDrive-BESTSELLER/Documents/Projects/WebDev/SampleSale-POS/middleware.ts)

Current policy includes:

- Content Security Policy with per-request nonce for the inline theme bootstrap
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` for camera/microphone/geolocation
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`

## Input Validation

Validation is standardized through shared Zod primitives and a common API validation response helper:

- [src/lib/validation/primitives.ts](/Users/anthony.lariccia/Library/CloudStorage/OneDrive-BESTSELLER/Documents/Projects/WebDev/SampleSale-POS/src/lib/validation/primitives.ts)
- [src/lib/validation/http.ts](/Users/anthony.lariccia/Library/CloudStorage/OneDrive-BESTSELLER/Documents/Projects/WebDev/SampleSale-POS/src/lib/validation/http.ts)

Current behavior:

- mutating route bodies are schema-validated before use
- dynamic route params are schema-validated before authorization and Prisma access
- shared primitives normalize emails and uppercase structured codes where applicable
- invalid payloads return a consistent `400` response with `error` and flattened `details`

Current limitation:

- server-side query/search param validation is still minimal because the current API surface is not query-driven

## Container Deployment

Docker packaging is now included for review and local server deployment:

- [Dockerfile](/Users/anthony.lariccia/Library/CloudStorage/OneDrive-BESTSELLER/Documents/Projects/WebDev/SampleSale-POS/Dockerfile)
- [.dockerignore](/Users/anthony.lariccia/Library/CloudStorage/OneDrive-BESTSELLER/Documents/Projects/WebDev/SampleSale-POS/.dockerignore)
- [docker-compose.yml](/Users/anthony.lariccia/Library/CloudStorage/OneDrive-BESTSELLER/Documents/Projects/WebDev/SampleSale-POS/docker-compose.yml)

### Build locally

```bash
docker build -t sample-sales-app:local .
```

### Run with compose

```bash
docker compose up --build -d
```

### Deployment notes for `MONWEBDEV01`

- The container exposes port `3000`
- `next.config.ts` uses `output: "standalone"` so the image only needs the built standalone output plus Prisma assets
- The container expects all runtime configuration to be provided through environment variables
- `MONWEBDEV01` can reach `MONPOSTGRDEV01:5432` directly, so `DATABASE_URL` should point there rather than using any local tunnel pattern
- `docker-compose.yml` now includes a `sample-sales-tools` service for one-off Prisma tasks inside Docker

Recommended first-pass server flow:

```bash
cp .env.example .env
# edit .env with MONWEBDEV01 production-like values

docker compose --profile tools run --rm sample-sales-tools npx prisma db push
docker compose --profile tools run --rm sample-sales-tools npm run db:seed
docker compose up --build -d sample-sales-app
```

Useful checks:

```bash
docker compose ps
docker compose logs -f sample-sales-app
curl http://localhost:3000/api/health
```

### Required runtime environment variables

- `DATABASE_URL`
- `APP_URL`
- `SESSION_SECRET`
- `MAIL_PROVIDER`
- `MAILJET_API_KEY`
- `MAILJET_API_SECRET`
- `MAIL_FROM`

### Mailjet delivery status tracking

Email delivery history is no longer limited to the initial provider acceptance result.

- Send operations create a delivery record with status `QUEUED` or `FAILED`
- The admin delivery-history page performs one server-side Mailjet status sync when it loads
- The page also exposes a manual `Refresh statuses` action for on-demand polling
- Status refresh is keyed off Mailjet `MessageID` values returned by the send API
- Recent rows can move to `DELIVERED`, `OPENED`, `CLICKED`, `BOUNCED`, `BLOCKED`, `SPAM`, `UNSUBSCRIBED`, or `FAILED`

## Database Notes

This project was developed against a PostgreSQL instance reached through a local tunnel. Reviewers should not assume that same connectivity model exists in server environments.

Example local pattern used during development:

```text
localhost:65432 -> MONPOSTGRDEV01:5432
```

That is a developer convenience, not a deployment strategy.

## Important Routes

### Staff

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/catalog`
- `/orders`
- `/settings`

### Admin

- `/admin`
- `/admin/catalog`
- `/admin/orders`
- `/admin/email-templates`
- `/admin/settings`
- `/admin/users`

## Important APIs

### Auth

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/register`
- `POST /api/auth/password-reset/request`
- `POST /api/auth/password-reset/reset`

### Staff

- `GET /api/catalog`
- `POST /api/orders`
- `GET /api/orders`
- `PATCH /api/orders/[orderId]`
- `POST /api/orders/[orderId]/receipt`
- `GET /api/users/me/preferences`
- `PATCH /api/users/me/preferences`

### Admin

- `PATCH /api/admin/catalog/[itemId]`
- `PATCH /api/admin/countries/[countryCode]`
- `POST /api/admin/tax-rules/new`
- `PATCH /api/admin/tax-rules/[ruleId]`
- `POST /api/admin/email-templates`
- `PATCH /api/admin/email-templates/[templateId]`
- `POST /api/admin/users`
- `PATCH /api/admin/users/[userId]`
- `DELETE /api/admin/users/[userId]`
- `POST /api/admin/users/[userId]/invite`

## Review Guidance

If you are reviewing this codebase internally, the most valuable review areas are:

1. RBAC correctness by role
2. Checkout integrity and tax calculation consistency
3. Auth/session/reset flows
4. Admin mutation safety and auditability
5. Deployment assumptions for containerized hosting
6. UX quality on iPad and narrow laptop widths

## Suggested Next Steps After Review

1. Finalize Postgres connectivity from `MONWEBDEV01`
2. Replace in-process rate limiting with shared infrastructure
3. Remove legacy role/data compatibility paths
4. Add centralized monitoring and error reporting
5. Add CI checks for lint, typecheck, and Prisma validation
6. Add production build and container smoke tests in CI
