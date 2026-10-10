-- Run this migration before deploying the updated API.
-- Existing subscriptions keep a NULL Site ID until a site is assigned by a super admin.
ALTER TABLE subscriptions
  ADD COLUMN siteId VARCHAR(50) NULL,
  ADD UNIQUE KEY uniq_subscriptions_site_id (siteId);
