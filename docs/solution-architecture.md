# Solution Architecture

## Architecture Summary

The application is a single full-stack Next.js deployment with a shared design system and a server-first data boundary. Staff-facing routes handle catalog browsing, carting, checkout, and order lookup. Admin-facing routes handle configuration, catalog maintenance, template management, and reporting. PostgreSQL is the source of truth. Prisma models enforce relational integrity while service-layer modules own tax calculation, receipt composition, audit logging, and future payment-provider integration.

## Recommended Stack

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS
- Backend: Next.js Route Handlers and server components
- Data: PostgreSQL with Prisma
- Auth: local auth with cookie session now, Entra ID provider later
- Email: provider abstraction with Mailjet implementation option
- Logging: structured application logs plus `AuditLog` table
- Hosting: Vercel, Azure App Service, or containerized Node deployment

## Domain Design

### Core principles

- Orders and line items snapshot product and tax data at time of sale.
- Country behavior is data-driven through `Country`, `TaxRule`, `LocalizedLabel`, `EmailTemplate`, and `AppSetting`.
- Admin writes are auditable.
- Payment confirmation is explicit but decoupled from terminal integration.

### Key entities

- `User`, `Role`, `UserRole`
- `Country`, `StoreEvent`
- `TaxRule`
- `CatalogItem`, `CatalogItemCountry`
- `Order`, `OrderLineItem`
- `EmailTemplate`
- `AppSetting`, `LocalizedLabel`
- `AuditLog`

## Responsive UX

- Tablet-first split layout for catalog and cart
- Sticky cart summary and checkout actions
- Single-thumb reach actions on mobile
- Large quantity controls and high-contrast status chips
- Minimal modal dependence to keep staff throughput high

## Authentication And Authorization

- Local auth with hashed passwords and signed cookie session
- Route guard middleware for `/catalog`, `/checkout`, `/orders`, and `/admin`
- Role checks at the handler level
- Future Entra ID via provider-specific identity table or external subject mapping

## Country And Tax Configuration

- `Country` stores locale, currency, tax inclusivity, receipt labels, and support flags
- `TaxRule` stores effective dates, percent rates, and optional region overrides like Quebec
- Calculation service resolves active rules by country plus region, then snapshots results on the order
- Receipt templates are keyed by country and language

## Email Template Management

- Admins edit subject, html body, text body, and template metadata in-app
- Merge fields are explicit, validated, and previewable
- Receipt sending uses a provider-agnostic `mailService`
- Resend receipt uses stored order snapshot plus latest approved template

## Deployment Notes

- PostgreSQL required in every environment
- All secrets and provider keys live in environment variables
- Prefer managed Postgres, object storage only if attachments are added later
- Add centralized monitoring before production rollout
