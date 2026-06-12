# Foundations: Architecture

## Purpose

This document describes the current-state architecture of the Sample Sales application. It is intended as a practical engineering reference for how the app is structured today, where responsibilities live, and which boundaries matter when adding or changing features.

It complements, rather than replaces, [docs/solution-architecture.md](/Users/anthony.lariccia/Library/CloudStorage/OneDrive-BESTSELLER/Documents/Projects/WebDev/SampleSale-POS/docs/solution-architecture.md). That file is still useful as a high-level direction document; this one is meant to reflect the running codebase.

## System Shape

The application is a single full-stack Next.js deployment that serves:

- staff-facing selling workflows
- admin configuration and support workflows
- authentication and account flows
- JSON API routes for mutations and server-owned reads

PostgreSQL is the system of record. Prisma is the only data-access layer. The app is packaged as a containerized Node runtime and, in the current dev/UAT deployment, runs behind an nginx reverse proxy that terminates HTTPS.

## Core Architectural Principles

- One deployable application, not separate frontend and backend services.
- Server-owned business logic for pricing, taxes, auth, and persistence.
- Data-driven country behavior instead of UI-only branching.
- Snapshot-based orders and receipts so historical transactions remain stable.
- Shared validation and shared copy layers to reduce route-by-route drift.
- Role-aware access control enforced on the server, not only in navigation.

## Runtime Topology

### Web application

- Framework: Next.js 15 App Router
- Language: TypeScript
- UI runtime: React 19
- Styling: Tailwind CSS plus local component primitives

The web app owns:

- server-rendered pages
- server components
- route handlers under `src/app/api`
- auth/session cookie issuance and verification
- business services in `src/lib/services`

### Database

- Engine: PostgreSQL
- ORM/client: Prisma

Prisma schema lives in [prisma/schema.prisma](/Users/anthony.lariccia/Library/CloudStorage/OneDrive-BESTSELLER/Documents/Projects/WebDev/SampleSale-POS/prisma/schema.prisma).

Important domain areas in the schema:

- identity and authorization: `User`, `Role`, `UserRole`
- country configuration: `Country`, `TaxRule`, `LocalizedLabel`, `AppSetting`
- catalog: `CatalogItem`, `CatalogItemCountry`
- selling: `Order`, `OrderLineItem`, `StoreEvent`
- mail and templates: `EmailTemplate`, `EmailDelivery`
- auditability: `AuditLog`

### Edge / deployment

Current deployment shape:

- `sample-sales-app`: internal app container
- `sample-sales-nginx`: public reverse proxy
- PostgreSQL hosted separately

The proxy publishes `80/443`, redirects HTTP to HTTPS, and forwards requests to the Next.js container over the internal Docker network.

## Application Surfaces

### Auth surface

Routes under `src/app/(auth)` provide:

- login
- register
- forgot password
- reset password

Key characteristics:

- local email/password auth
- signed cookie session
- first-render locale detection from browser language
- top-right theme and language controls

### Staff surface

Routes under `src/app/(staff)` provide:

- catalog/sell flow
- checkout
- personal order history
- staff settings

The staff POS is optimized for touch-first usage and keeps pricing, tax, and order creation on the server boundary. The client can build carts and submit intent, but authoritative totals are recalculated server-side before order persistence.

### Admin surface

Routes under `src/app/(admin)` provide:

- catalog management
- country settings
- tax configuration
- email template management
- user and role administration
- order support views
- email delivery history

Admin capabilities are role-gated. Navigation visibility is role-aware, but route handlers remain the enforcement point.

### API surface

Route handlers under `src/app/api` own mutations and privileged reads.

Major groups:

- `api/auth`
- `api/admin`
- `api/catalog`
- `api/orders`
- `api/users`
- `api/health`

The expected pattern is:

1. parse input
2. validate with shared Zod schemas/primitives
3. authorize from the session
4. call domain/service logic
5. persist through Prisma
6. return a stable JSON response shape

## Directory Responsibilities

### `src/app`

Owns route structure, page composition, route handlers, and layout boundaries.

- route groups such as `(auth)`, `(staff)`, and `(admin)` separate user-facing experiences
- `api` contains server entrypoints for data mutations and server-owned reads

### `src/components`

Owns reusable UI and feature-specific client components.

Main areas:

- `admin`
- `auth`
- `layout`
- `pos`
- `theme`
- `ui`

### `src/lib`

Owns non-visual application logic.

Main areas:

- `auth`: session, guards, password and token helpers
- `config`: environment parsing and app configuration
- `db`: Prisma client and seed/mock support
- `http`: request/response helpers
- `observability`: structured logging
- `security`: rate limiting and other security helpers
- `services`: tax, mail, receipt, order, and other domain logic
- `validation`: Zod schemas and shared primitives

This folder is the main architecture boundary. If logic is important, reusable, or security-sensitive, it should live here rather than directly in a component.

## Data Model And Domain Rules

### Catalog

Catalog items are global products with country-specific availability and optional price overrides.

- base fields live on `CatalogItem`
- per-country availability and override price live on `CatalogItemCountry`
- bilingual naming is supported through `name` and `nameFr`

The server selects the display name based on the active language context.

### Country behavior

Country behavior is modeled in data, not hardcoded in view components.

Examples:

- company display name
- locale defaults
- currency
- tax inclusivity
- legal labels
- receipt footers
- email templates by country and language

This is one of the app's core design choices. Country-specific behavior should continue to be added through configuration tables first, not through scattered UI conditionals.

### Orders

Orders snapshot the transactional state at checkout time:

- item name
- SKU
- unit price
- tax rate
- tax amount
- line total

That snapshotting is intentional. Historical receipts must not drift when catalog names, tax rules, or prices change later.

### Email delivery history

The app records outbound email attempts in `EmailDelivery`.

Current operational reality:

- the app can reliably know when the provider accepted or failed a send
- it does not currently have authoritative downstream delivery/open/click truth in the deployed environment

The UI and data model should continue to reflect what the system can actually prove, not what would be convenient to display.

## Authentication And Authorization

Current auth model:

- local credentials
- hashed passwords
- cookie session
- password reset with hashed, expiring, single-use tokens

Authorization model:

- roles stored in the database
- route-level checks on protected handlers
- role-aware UI to reduce dead-end navigation

Important rule:

- `NODE_ENV=production` is the correct runtime mode for deployed environments, including UAT/demo
- deployment labeling is handled separately through `APP_ENV`

## Localization

The app supports bilingual operation with a shared copy layer.

Important characteristics:

- initial auth-page language is inferred from browser `Accept-Language`
- users can switch language explicitly
- user preference is persisted and reflected in the session cookie
- server-rendered shell content depends on the session language, so cookie refresh matters when preferences change
- catalog item display supports English and French naming

Copy and labels are centrally managed in [src/lib/i18n.ts](/Users/anthony.lariccia/Library/CloudStorage/OneDrive-BESTSELLER/Documents/Projects/WebDev/SampleSale-POS/src/lib/i18n.ts).

## Validation Strategy

Validation is centralized and reused.

- shared primitives live under `src/lib/validation`
- route handlers use Zod schemas instead of ad hoc checks
- common normalization rules exist for emails, IDs, locales, country codes, SKUs, and tax categories

This reduces drift across routes and keeps error shapes consistent.

## Observability

The app emits structured JSON logs through [src/lib/observability/logger.ts](/Users/anthony.lariccia/Library/CloudStorage/OneDrive-BESTSELLER/Documents/Projects/WebDev/SampleSale-POS/src/lib/observability/logger.ts).

Current logging intent:

- machine-readable stdout/stderr logs
- consistent log levels
- event-oriented entries
- redaction of sensitive fields
- environment labeling through `APP_ENV`
- runtime labeling through `NODE_ENV`

Still missing at the architecture level:

- centralized log aggregation
- metrics
- distributed tracing
- alerts

## Security Posture

Security-relevant foundations already present:

- hashed passwords
- signed cookie sessions
- route-level authorization
- centralized validation
- basic rate limiting on auth/reset flows
- centralized security headers
- audit logging for admin mutations
- HTTPS termination at the reverse proxy in deployed environments

Current constraints and follow-up areas:

- some rate limiting is still in-process rather than distributed
- CSRF strategy is acceptable for the current same-origin model but would need to change for a split frontend
- environment-specific cookie/domain rules still need disciplined review in each environment

## Deployment And Environment Model

Important environment variables include:

- `DATABASE_URL`
- `APP_URL`
- `CORS_ALLOWED_ORIGINS`
- `SESSION_SECRET`
- `APP_ENV`
- `MAIL_PROVIDER`
- `MAILJET_API_KEY`
- `MAILJET_API_SECRET`
- `MAIL_FROM`
- `LOG_LEVEL`
- `APP_LOG_SERVICE`

Environment conventions:

- `NODE_ENV` controls runtime behavior
- `APP_ENV` labels the deployment for logs and UI badges

That split is intentional. Do not use `NODE_ENV=test` or `NODE_ENV=demo` as a substitute for deployment labeling on a real deployed environment.

## Change Guidance

When making changes, prefer these rules:

- put business rules in `src/lib/services`, not inside components
- validate inputs once at the route boundary with shared schemas
- keep country-specific behavior data-driven
- keep order and receipt history snapshot-safe
- update both UI copy and server behavior when adding bilingual features
- treat admin UI affordances as convenience only; authorization belongs on the server

## Suggested Reading Order

For a new engineer joining the project, the fastest useful reading order is:

1. [README.md](/Users/anthony.lariccia/Library/CloudStorage/OneDrive-BESTSELLER/Documents/Projects/WebDev/SampleSale-POS/README.md)
2. [docs/foundations/architecture.md](/Users/anthony.lariccia/Library/CloudStorage/OneDrive-BESTSELLER/Documents/Projects/WebDev/SampleSale-POS/docs/foundations/architecture.md)
3. [docs/api-contract.md](/Users/anthony.lariccia/Library/CloudStorage/OneDrive-BESTSELLER/Documents/Projects/WebDev/SampleSale-POS/docs/api-contract.md)
4. [prisma/schema.prisma](/Users/anthony.lariccia/Library/CloudStorage/OneDrive-BESTSELLER/Documents/Projects/WebDev/SampleSale-POS/prisma/schema.prisma)
5. `src/app`
6. `src/lib/services`

