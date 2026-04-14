# Sample Sale POS

Production-ready starter architecture for a responsive sample-sale POS that replaces the current PowerApp with a modern Next.js application.

## High-Level Architecture Summary

- Single Next.js App Router application for staff and admin experiences.
- PostgreSQL as the system of record with Prisma ORM and audited admin writes.
- Local email/password authentication now, clean adapter boundary for Microsoft Entra ID later.
- Server-side validation on all mutating APIs with RBAC and country-aware configuration.
- Touch-first POS workflow optimized for iPad, iPhone, and laptop.
- Manual external pinpad confirmation at checkout, with a future payment integration seam.

## Recommended Stack And Reasoning

- `Next.js + React + TypeScript`: one deployment artifact, fast iteration, SSR where helpful, strong enterprise maintainability.
- `Tailwind CSS + app-local component primitives`: fast, consistent responsive UI without heavy design-system overhead.
- `PostgreSQL + Prisma`: relational integrity, auditable schema evolution, strong fit for orders, line items, taxes, and configuration.
- `Zod`: shared validation for route handlers and future form actions.
- `Cookie-based session auth`: simple local-auth start with an explicit provider abstraction for Entra ID migration.
- `Mail provider abstraction`: start with Mailjet or console transport; swap providers without touching checkout logic.

## Route/Page Structure

- `/login`
- `/catalog`
- `/checkout`
- `/orders`
- `/admin`
- `/admin/catalog`
- `/admin/orders`
- `/admin/email-templates`
- `/admin/settings`

## API Endpoints

- `POST /api/auth/login`
- `GET /api/catalog`
- `POST /api/orders`
- `GET /api/orders?query=...`
- `GET /api/admin/catalog`
- `POST /api/admin/catalog`
- `GET /api/admin/countries`
- `GET /api/admin/email-templates`
- `POST /api/admin/email-templates`

## Database Schema

See [prisma/schema.prisma](/Users/anthony.lariccia/Library/CloudStorage/OneDrive-BESTSELLER/Documents/Projects/WebDev/SampleSale-POS/prisma/schema.prisma) and [docs/solution-architecture.md](/Users/anthony.lariccia/Library/CloudStorage/OneDrive-BESTSELLER/Documents/Projects/WebDev/SampleSale-POS/docs/solution-architecture.md).

## API Design

See [docs/api-contract.md](/Users/anthony.lariccia/Library/CloudStorage/OneDrive-BESTSELLER/Documents/Projects/WebDev/SampleSale-POS/docs/api-contract.md).

## Implementation Plan

1. Stand up the Next.js app shell, Prisma schema, seed data, and local auth.
2. Replace mock repositories with Prisma-backed services and add migrations.
3. Connect transactional email provider and receipt resend workflow.
4. Add audit logging for every admin mutation and sensitive checkout action.
5. Introduce Entra ID as an additional auth provider once local-auth rollout is stable.
6. Add reporting export, SMS receipts, and payment-terminal integration behind service abstractions.

## Environment Setup

1. Copy `.env.example` to `.env`.
2. Install dependencies with `npm install`.
3. Run `npm run db:generate`.
4. Run `npm run db:migrate`.
5. Run `npm run db:seed`.
6. Start locally with `npm run dev`.

## Notes

- Country rules, tax logic, receipt labels, and template content are configuration-driven.
- The checkout flow stores line-item and tax snapshots so historical orders remain accurate after catalog changes.
- Admin UI replaces direct SharePoint editing and gives the business an auditable control surface.
