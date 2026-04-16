# UAT Checklist

Use this checklist before the first local Docker deployment or any handoff for internal review.

## Seeded Test Users

After `npm run db:seed`, the following users should exist:

- `admin@samplesale.local`
  - roles: `STAFF`, `FULL_ADMIN`
- `staff@samplesale.local`
  - roles: `STAFF`
- `catalog.admin@samplesale.local`
  - roles: `CATALOG_ADMIN`
- `finance@samplesale.local`
  - roles: `FINANCE`
- `operations@samplesale.local`
  - roles: `OPERATIONS`

Default password:

- `SEED_TEST_USER_PASSWORD` if set
- otherwise `SEED_ADMIN_PASSWORD`
- otherwise `ChangeMe123!`

## Access Matrix

Expected admin access by role:

- `STAFF`
  - no admin navigation
  - can access `/catalog`, `/orders`, `/settings`
- `CATALOG_ADMIN`
  - can access `/admin/catalog`
  - cannot access `/admin/orders`
  - cannot access `/admin/settings`
  - cannot access `/admin/email-templates`
  - cannot access `/admin/users`
- `FINANCE`
  - can access `/admin/orders`
  - cannot edit/support orders
  - cannot access catalog/settings/templates/users
- `OPERATIONS`
  - can access `/admin/catalog`
  - can access `/admin/orders`
  - can access `/admin/settings`
  - can access `/admin/email-templates`
  - cannot access `/admin/users`
- `FULL_ADMIN`
  - full access to all admin areas

## Auth Flows

- login succeeds for seeded users
- logout clears session and returns to `/login`
- self-registration creates a `STAFF` user and signs them in
- forgot-password email issues a valid reset link
- reset-password enforces password rules and activates invited users
- invited user setup flow works after `Resend invite`

## Staff Flows

- first-time preference modal appears only when preferences are incomplete
- country and language save correctly
- catalog loads and search works
- cart builds correctly
- checkout requires:
  - customer name
  - customer email
  - payment marked received
- order persists successfully
- receipt send succeeds
- past order email can be corrected
- past order receipt can be resent

## Country / Tax Checks

- `CA`
  - GST + QST behavior
- `US`
  - included-pricing / zero extra tax behavior
- `AU`
  - receipt and checkout show `Included GST`

## Admin Catalog

- catalog list loads
- add product works
- edit product works
- SKU uniqueness is enforced
- per-country availability works
- per-country override pricing works

## Admin Orders

- order list loads for `FINANCE`, `OPERATIONS`, `FULL_ADMIN`
- `FINANCE` can view but not perform support mutations
- `OPERATIONS` and `FULL_ADMIN` can resend receipt

## Admin Settings / Templates

- company name updates persist
- country receipt footer updates persist
- legal label updates persist
- tax rule create/update works
- email template create/update works
- live preview renders
- a sent receipt matches the saved template closely enough in real email clients

## Users / Roles

- `FULL_ADMIN` can create, update, invite, and delete users
- `CATALOG_ADMIN`, `FINANCE`, `OPERATIONS` do not see `/admin/users`
- role changes take effect after next login

## Audit / Logging

- admin mutations write audit rows
- auth and receipt flows emit structured logs
- `/api/health` returns `200` with valid env and DB connectivity
