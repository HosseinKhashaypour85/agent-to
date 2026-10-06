import { Router } from "express";

import {
  botInfo,
  connectBot,
  disconnectBot,
  getChannel,
  registerWebhook,
  sendMessage,
  webhook,
} from "./telegram.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

/*
|--------------------------------------------------------------------------
| Public Telegram Webhook
|--------------------------------------------------------------------------
|
| Telegram directly calls this endpoint.
| DO NOT add JWT authentication here.
|
*/
router.post(
  "/webhook/:channelId",
  webhook
);

/*
|--------------------------------------------------------------------------
| Protected Telegram Management API
|--------------------------------------------------------------------------
|
| These endpoints are used by the CRM.
|
*/

router.post(
  "/connect",
  authMiddleware,
  connectBot
);

router.get(
  "/bot-info",
  authMiddleware,
  botInfo
);

router.get(
  "/channels/:channelId",
  authMiddleware,
  getChannel
);

router.post(
  "/channels/:channelId/disconnect",
  authMiddleware,
  disconnectBot
);

router.post(
  "/channels/:channelId/webhook",
  authMiddleware,
  registerWebhook
);

router.post(
  "/send",
  authMiddleware,
  sendMessage
);

export default router;