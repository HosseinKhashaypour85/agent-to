import { Router } from "express";

import {
  getCustomerConversationsController,
  getConversationDetailsController,
  getConversationMessagesController,
  getCustomerHistoryController,
  getCustomerTimelineController,
  getCustomerProfileController,
} from "./customer-history.controller";

import {
  calculateLeadScoreController,
  getLeadScoreController,
  getLeadsByTemperatureController,
  getDashboardLeadStatsController,
} from "./lead-scoring.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get(
  "/dashboard/lead-stats",
  getDashboardLeadStatsController
);

router.post(
  "/lead-score/calculate",
  calculateLeadScoreController
);

router.get(
  "/lead-score/:customerId",
  getLeadScoreController
);

router.get(
  "/lead-score/temperature/:temperature",
  getLeadsByTemperatureController
);

router.get(
  "/customers/:customerId/conversations",
  getCustomerConversationsController
);

router.get(
  "/customers/:customerId/history",
  getCustomerHistoryController
);

router.get(
  "/customers/:customerId/timeline",
  getCustomerTimelineController
);

router.get(
  "/customers/:customerId/profile",
  getCustomerProfileController
);

router.get(
  "/conversations/:conversationId",
  getConversationDetailsController
);

router.get(
  "/conversations/:conversationId/messages",
  getConversationMessagesController
);

export default router;