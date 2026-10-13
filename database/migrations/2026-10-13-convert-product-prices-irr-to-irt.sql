-- Run once after taking a database backup.
-- Products marked IRR are stored in Iranian rials; convert amounts to tomans (1 toman = 10 rials).
-- Only rows currently marked IRR are changed, so rerunning this migration will not divide them again.
START TRANSACTION;

UPDATE agent_products
SET
  price = CASE WHEN price IS NULL THEN NULL ELSE price / 10 END,
  compareAtPrice = CASE WHEN compareAtPrice IS NULL THEN NULL ELSE compareAtPrice / 10 END,
  currency = 'IRT',
  updatedAt = CURRENT_TIMESTAMP
WHERE currency = 'IRR';

COMMIT;
