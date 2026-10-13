-- IMPORTANT: Take a database backup before running.
-- This migration assumes every agent_products row marked IRR stores prices in rials.
-- 1 toman = 10 rials. Run this migration exactly once.
START TRANSACTION;

UPDATE agent_products
SET
  price = CASE WHEN price IS NULL THEN NULL ELSE price / 10 END,
  compareAtPrice = CASE WHEN compareAtPrice IS NULL THEN NULL ELSE compareAtPrice / 10 END,
  currency = 'IRT',
  updatedAt = CURRENT_TIMESTAMP
WHERE currency = 'IRR';

COMMIT;
