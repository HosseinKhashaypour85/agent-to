import { Request, Response } from "express";

import {
  connectTelegramBot,
  disconnectTelegramBot,
  getTelegramBotInfo,
  getTelegramChannel,
  handleTelegramWebhook,
  sendTelegramMessage,
  setTelegramWebhook,
} from "./telegram.service";

import AgentChannel from "../../models/AgentChannel";

import { AuthRequest } from "../../middlewares/auth.middleware";

/*
|--------------------------------------------------------------------------
| Connect Telegram Bot
|--------------------------------------------------------------------------
|
| POST /api/v1/telegram/connect
|
*/
export async function connectBot(
  req: AuthRequest,
  res: Response
) {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      agentId,
      channelId,
      botToken,
      name,
    } = req.body || {};

    if (!agentId) {
      return res.status(400).json({
        success: false,
        message: "agentId is required",
      });
    }

    if (!channelId) {
      return res.status(400).json({
        success: false,
        message: "channelId is required",
      });
    }

    if (!botToken?.trim()) {
      return res.status(400).json({
        success: false,
        message: "botToken is required",
      });
    }

    const result = await connectTelegramBot({
      tenantId,
      agentId,
      channelId,
      botToken: botToken.trim(),
      name,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("TELEGRAM CONNECT ERROR:", error);

    if (
      error instanceof Error &&
      error.message === "TELEGRAM_CHANNEL_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Telegram channel not found",
      });
    }

    if (
      error instanceof Error &&
      error.message === "TELEGRAM_AGENT_MISMATCH"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Telegram channel does not belong to this agent",
      });
    }

    if (
      error instanceof Error &&
      error.message === "TELEGRAM_BOT_TOKEN_REQUIRED"
    ) {
      return res.status(400).json({
        success: false,
        message: "Telegram bot token is required",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Telegram API errors
    |--------------------------------------------------------------------------
    |
    | مثل:
    | Unauthorized
    | Bad Request: ...
    |
    */
    if (
      error instanceof Error &&
      error.message
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to connect Telegram bot",
    });
  }
}

/*
|--------------------------------------------------------------------------
| Get Telegram Bot Info
|--------------------------------------------------------------------------
|
| GET /api/v1/telegram/bot-info?botToken=...
|
*/
export async function botInfo(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user?.tenantId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const botToken =
      typeof req.query.botToken === "string"
        ? req.query.botToken.trim()
        : "";

    if (!botToken) {
      return res.status(400).json({
        success: false,
        message: "botToken is required",
      });
    }

    const bot =
      await getTelegramBotInfo(botToken);

    return res.status(200).json({
      success: true,
      bot: {
        id: bot.id,
        username: bot.username,
        firstName: bot.first_name,
        isBot: bot.is_bot,
      },
    });
  } catch (error) {
    console.error(
      "TELEGRAM BOT INFO ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Invalid Telegram bot token",
    });
  }
}

/*
|--------------------------------------------------------------------------
| Get Telegram Channel
|--------------------------------------------------------------------------
|
| GET /api/v1/telegram/channels/:channelId
|
*/
export async function getChannel(
  req: AuthRequest,
  res: Response
) {
  try {
    const tenantId =
      req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const channelId =
      req.params.channelId;

    if (!channelId) {
      return res.status(400).json({
        success: false,
        message: "channelId is required",
      });
    }

    const result =
      await getTelegramChannel(
        tenantId,
        String(channelId)
      );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(
      "GET TELEGRAM CHANNEL ERROR:",
      error
    );

    if (
      error instanceof Error &&
      error.message ===
        "TELEGRAM_CHANNEL_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Telegram channel not found",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to get Telegram channel",
    });
  }
}

/*
|--------------------------------------------------------------------------
| Disconnect Telegram Bot
|--------------------------------------------------------------------------
|
| POST /api/v1/telegram/channels/:channelId/disconnect
|
*/
export async function disconnectBot(
  req: AuthRequest,
  res: Response
) {
  try {
    const tenantId =
      req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const channelId =
      req.params.channelId;

    if (!channelId) {
      return res.status(400).json({
        success: false,
        message: "channelId is required",
      });
    }

    const result =
      await disconnectTelegramBot(
        tenantId,
        String(channelId)
      );

    return res.status(200).json(result);
  } catch (error) {
    console.error(
      "TELEGRAM DISCONNECT ERROR:",
      error
    );

    if (
      error instanceof Error &&
      error.message ===
        "TELEGRAM_CHANNEL_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Telegram channel not found",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to disconnect Telegram bot",
    });
  }
}

/*
|--------------------------------------------------------------------------
| Register Telegram Webhook
|--------------------------------------------------------------------------
|
| POST /api/v1/telegram/channels/:channelId/webhook
|
*/
export async function registerWebhook(
  req: AuthRequest,
  res: Response
) {
  try {
    const tenantId =
      req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const channelId =
      req.params.channelId;

    if (!channelId) {
      return res.status(400).json({
        success: false,
        message:
          "channelId is required",
      });
    }

    const channel =
      await AgentChannel.findOne({
        where: {
          id: channelId,
          tenantId,
          type: "TELEGRAM",
        },
      });

    if (!channel) {
      return res.status(404).json({
        success: false,
        message:
          "Telegram channel not found",
      });
    }

    const config =
      (channel.config as Record<
        string,
        unknown
      > | null) || {};

    const botToken =
      typeof config.botToken === "string"
        ? config.botToken.trim()
        : "";

    if (!botToken) {
      return res.status(400).json({
        success: false,
        message:
          "Telegram bot token is not configured",
      });
    }

    const result =
      await setTelegramWebhook(
        botToken,
        String(channelId)
      );

    channel.config = {
      ...config,
      webhookUrl:
        result.webhookUrl,
    };

    await channel.save();

    return res.status(200).json({
      success: true,
      webhook: result,
    });
  } catch (error) {
    console.error(
      "TELEGRAM WEBHOOK ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to register Telegram webhook",
    });
  }
}

/*
|--------------------------------------------------------------------------
| Send Telegram Message
|--------------------------------------------------------------------------
|
| POST /api/v1/telegram/send
|
*/
export async function sendMessage(
  req: AuthRequest,
  res: Response
) {
  try {
    const tenantId =
      req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      channelId,
      chatId,
      text,
    } = req.body || {};

    if (!channelId) {
      return res.status(400).json({
        success: false,
        message:
          "channelId is required",
      });
    }

    if (
      chatId === undefined ||
      chatId === null ||
      chatId === ""
    ) {
      return res.status(400).json({
        success: false,
        message:
          "chatId is required",
      });
    }

    if (!text?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "text is required",
      });
    }

    const channel =
      await AgentChannel.findOne({
        where: {
          id: channelId,
          tenantId,
          type: "TELEGRAM",
        },
      });

    if (!channel) {
      return res.status(404).json({
        success: false,
        message:
          "Telegram channel not found",
      });
    }

    const config =
      (channel.config as Record<
        string,
        unknown
      > | null) || {};

    const botToken =
      typeof config.botToken === "string"
        ? config.botToken.trim()
        : "";

    if (!botToken) {
      return res.status(400).json({
        success: false,
        message:
          "Telegram bot token is not configured",
      });
    }

    const result =
      await sendTelegramMessage(
        botToken,
        chatId,
        text
      );

    return res.status(200).json({
      success: true,
      message:
        "Telegram message sent",
      data: result,
    });
  } catch (error) {
    console.error(
      "TELEGRAM SEND MESSAGE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to send Telegram message",
    });
  }
}

/*
|--------------------------------------------------------------------------
| Telegram Webhook
|--------------------------------------------------------------------------
|
| POST /api/v1/telegram/webhook/:channelId
|
| IMPORTANT:
| No JWT authentication.
|
*/
export async function webhook(
  req: Request,
  res: Response
) {
  try {
    const channelId =
      req.params.channelId;

    if (!channelId) {
      return res.status(400).json({
        success: false,
        message:
          "channelId is required",
      });
    }

    const result =
      await handleTelegramWebhook(
        String(channelId),
        req.body
      );

    return res.status(200).json(result);
  } catch (error) {
    console.error(
      "TELEGRAM WEBHOOK ERROR:",
      error
    );

    /*
    |--------------------------------------------------------------------------
    | Telegram باید 200 بگیرد تا دوباره update را ارسال نکند.
    |--------------------------------------------------------------------------
    */
    return res.status(200).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Webhook received",
    });
  }
}