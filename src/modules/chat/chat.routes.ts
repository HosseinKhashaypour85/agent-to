import {
  Router,
} from "express";

import {
  chat,
  getHistory,
} from "./chat.controller";

const router =
  Router();


// GET /api/v1/chat/history?siteId=...&visitorId=...
router.get("/history", getHistory);

// POST /api/v1/chat
router.post("/", chat);


export default router;