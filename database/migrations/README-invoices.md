# Invoice schema

Apply `2026-10-12-create-invoices.sql` to the Agent-To MySQL database before deploying the API changes.

The invoice API is tenant-scoped using the authenticated user's `tenantId`. This first migration stores immutable buyer, seller, and item snapshots so later product/customer edits do not rewrite historical invoice data.

PDF generation and order/payment-driven invoice issuance are intentionally separate follow-up steps; this migration does not represent a tax-authority invoice integration.
