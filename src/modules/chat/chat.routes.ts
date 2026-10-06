import {
  Router,
} from "express";

import {
  chat,
} from "./chat.controller";

const router =
  Router();


// POST /api/v1/chat

router.post(
  "/",
  chat
);


export default router;