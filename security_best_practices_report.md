# Security Best Practices Report

## Executive Summary

The highest-impact issues were concentrated in three areas: an exposed admin catalog API, checkout trusting client-supplied pricing data, and the absence of a proper tokenized password reset flow. Those issues have now been fixed in code. The primary remaining gap is that abuse protection is still process-local in memory, which is acceptable for development and a single instance but not strong enough for horizontally scaled production.

## Critical

### SEC-001: Admin catalog API exposed mock data and writes without admin authorization
- Severity: Critical
- Location: `src/app/api/admin/catalog/route.ts`
- Evidence: The route previously returned `catalog` from mock data and accepted `POST` without reading session state or requiring an admin role.
- Impact: Anyone who could hit the endpoint could enumerate internal catalog data and submit unauthorized catalog writes.
- Fix: Replaced the route with a Prisma-backed admin-only handler using `requireRole("ADMIN")`, duplicate SKU checks, country validation, and audit logging.
- Status: Fixed

## High

### SEC-002: Checkout trusted client-supplied price, name, SKU, and tax inputs
- Severity: High
- Location: `src/app/api/orders/route.ts`
- Evidence: Checkout previously consumed `unitPrice`, `sku`, `name`, and `taxRate` from the request payload to build line items and totals.
- Impact: A manipulated client could undercharge orders, alter item snapshots, or distort tax calculations.
- Fix: The server now resolves catalog items, market availability, override pricing, and snapshots from the database, and the request schema only accepts `itemId` and `quantity`.
- Status: Fixed

### SEC-003: No secure password reset flow
- Severity: High
- Location: `src/app/api/auth/*`, `prisma/schema.prisma`
- Evidence: The app had admin-set passwords and registration, but no tokenized user-facing reset mechanism.
- Impact: Users could not safely recover access, increasing pressure toward insecure operational resets.
- Fix: Added hashed, single-use, expiring password reset tokens plus request/reset APIs, reset pages, and email delivery.
- Status: Fixed

### SEC-004: Authentication endpoints lacked abuse throttling
- Severity: High
- Location: `src/app/api/auth/login/route.ts`, `src/app/api/auth/register/route.ts`, `src/app/api/auth/password-reset/*`
- Evidence: Login, registration, and reset endpoints accepted unlimited attempts.
- Impact: Increased susceptibility to brute-force and email abuse attacks.
- Fix: Added per-IP and per-email in-memory rate limiting with retry headers.
- Status: Fixed

## Medium

### SEC-005: Password policy was weak for new or reset credentials
- Severity: Medium
- Location: `src/lib/validation/auth.ts`, `src/lib/validation/user-admin.ts`
- Evidence: Password validation only enforced a minimum length of 8 characters.
- Impact: Weak user-selected passwords would be accepted for registration and resets.
- Fix: New and reset passwords now require 12+ characters plus uppercase, lowercase, number, and symbol.
- Status: Fixed

### SEC-006: Admin email preview rendered raw HTML directly in the app
- Severity: Medium
- Location: `src/components/admin/email-template-manager.tsx`
- Evidence: The preview used `dangerouslySetInnerHTML` for administrator-authored template HTML.
- Impact: Malicious template markup could execute in the admin session context.
- Fix: Preview now renders through a sandboxed iframe using `srcDoc`.
- Status: Fixed

### SEC-007: Catalog API was readable without authentication
- Severity: Medium
- Location: `src/app/api/catalog/route.ts`
- Evidence: The route served sellable catalog data without requiring a session.
- Impact: Internal catalog availability and pricing could be enumerated outside the protected app shell.
- Fix: The endpoint now requires an authenticated session.
- Status: Fixed

## Residual Risk

### SEC-008: Rate limiting is not durable across multiple app instances
- Severity: Medium
- Location: `src/lib/security/rate-limit.ts`
- Evidence: The limiter stores counters in process memory.
- Impact: Limits reset on restart and do not coordinate across multiple server instances.
- Recommended Next Step: Move rate limiting to Redis or another shared store before production scale-out.
- Status: Open
