# Sample Sales Checkout

Internal review build for replacing the current Microsoft PowerApp sample-sale checkout flow with a full-stack Next.js application.

This repository is intended for engineering review. It is not just a UI prototype. The current state includes real local authentication, role-based access control, PostgreSQL persistence, configurable country behavior, receipt delivery via Mailjet, admin configuration surfaces, and a touch-first sell flow tuned for iPad/iPhone/laptop usage.

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
- Checkout no longer trusts client-supplied totals/prices
- Auth and reset endpoints have basic rate limiting
- Admin writes create audit entries
- Admin email preview is sandboxed
- Navigation is role-aware
- Staff sell flow is responsive and tuned for tablet/mobile use

Security notes are documented in:
- [security_best_practices_report.md](/Users/anthony.lariccia/Library/CloudStorage/OneDrive-BESTSELLER/Documents/Projects/WebDev/SampleSale-POS/security_best_practices_report.md)

## Known Gaps / Review Focus

These are the main areas that still need engineering review or follow-up before calling this production-ready:

- Distributed rate limiting
  - current implementation is in-process only
- Session hardening per environment
  - production cookie flags and domain rules still need environment-specific validation
- Docker and server deployment packaging
  - not yet added
- Observability
  - no centralized logging/monitoring integration yet
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
- `SESSION_SECRET`
- `MAIL_PROVIDER`
- `MAILJET_API_KEY`
- `MAILJET_API_SECRET`
- `MAIL_FROM`

### Install and run

```bash
npm install --cache ./.npm-cache
npx prisma db push
npx prisma generate
npm run db:seed
npm run dev -- --hostname 0.0.0.0
```

### Notes about this workspace

- This machine required a local npm cache path because of ownership issues under `~/.npm`
- Mailjet is already wired in code, but credentials and sender validation must be correct in `.env`

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

1. Add Docker packaging and deployment docs for `MONWEBDEV01`
2. Finalize Postgres connectivity from the target host
3. Replace in-process rate limiting with shared infrastructure
4. Remove legacy role/data compatibility paths
5. Add centralized monitoring and error reporting
6. Add CI checks for lint, typecheck, and Prisma validation
