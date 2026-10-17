import { Router } from "express";
import { syncWordPressProducts } from "./wordpress-product-sync.controller";

const router = Router();

// WordPress plugin syncs products in small batches. The controller validates
// the site ID and requires the submitted domain to match the registered site.
router.post("/sites/:siteId/products/sync", syncWordPressProducts);

export default router;
