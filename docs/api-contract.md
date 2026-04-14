# API Contract Summary

## Staff APIs

- `POST /api/auth/login`
  - Request: `email`, `password`
  - Response: session cookie + user payload
- `GET /api/catalog`
  - Response: active sellable catalog items
- `POST /api/orders`
  - Request: country, optional region, customer details, payment confirmation, cart lines
  - Response: order number, totals, receipt queue status
- `GET /api/orders`
  - Response: recent searchable orders
- `POST /api/orders/:orderId/receipt`
  - Response: receipt resend result

## Admin APIs

- `GET /api/admin/catalog`
- `POST /api/admin/catalog`
- `GET /api/admin/countries`
- `GET /api/admin/email-templates`
- `POST /api/admin/email-templates`

## Security Notes

- All mutating endpoints should require an authenticated session.
- Admin endpoints should require `ADMIN` role.
- Every admin mutation should write an `AuditLog` row before responding.
- Input validation belongs at the request boundary, not inside React components.
