import axios from "axios";
import AgentChannel from "../../models/AgentChannel";

interface TelegramApiResponse<T = any> {
  ok: boolean;
  result?: T;
  description?: string;
}

interface TelegramBotInfo {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
  can_join_groups?: boolean;
  can_read_all_group_messages?: boolean;
  supports_inline_queries?: boolean;
}

interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
}

interface TelegramChat {
  id: number;
  type: string;
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

const TELEGRAM_API = "https://api.telegram.org/bot";

const telegramAxios = axios.create({
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

async function telegramRequest<T = any>(
  botToken: string,
  method: string,
  body?: Record<string, unknown>
): Promise<T> {
  const response = await telegramAxios.post(
    `${TELEGRAM_API}${botToken}/${method}`,
    body || {}
  );

  const data = response.data as TelegramApiResponse<T>;

  if (!response.data.ok) {
    throw new Error(
      data.description || `TELEGRAM_API_ERROR:${method}`
    );
  }

  return data.result as T;
}

/*
|--------------------------------------------------------------------------
| Config
|--------------------------------------------------------------------------
*/

function getApiBaseUrl(): string {
  return (
    process.env.PUBLIC_API_URL ||
    "http://localhost:3000/api/v1"
  ).replace(/\/+$/, "");
}

function getWebhookUrl(
  channelId: string
): string {
  return `${getApiBaseUrl()}/api/v1/telegram/webhook/${channelId}`;
}

/*
|--------------------------------------------------------------------------
| Channel helpers
|--------------------------------------------------------------------------
*/

function getBotTokenFromChannel(
  channel: AgentChannel
): string {
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
    throw new Error(
      "TELEGRAM_BOT_TOKEN_NOT_CONFIGURED"
    );
  }

  return botToken;
}

/*
|--------------------------------------------------------------------------
| Get Bot Info
|--------------------------------------------------------------------------
*/

export async function getTelegramBotInfo(
  botToken: string
): Promise<TelegramBotInfo> {
  if (!botToken?.trim()) {
    throw new Error(
      "TELEGRAM_BOT_TOKEN_REQUIRED"
    );
  }

  return telegramRequest<TelegramBotInfo>(
    botToken.trim(),
    "getMe"
  );
}

/*
|--------------------------------------------------------------------------
| Set Webhook
|--------------------------------------------------------------------------
*/

export async function setTelegramWebhook(
  botToken: string,
  channelId: string
) {
  if (!botToken?.trim()) {
    throw new Error(
      "TELEGRAM_BOT_TOKEN_REQUIRED"
    );
  }

  if (!channelId?.trim()) {
    throw new Error(
      "TELEGRAM_CHANNEL_ID_REQUIRED"
    );
  }

  const webhookUrl =
    getWebhookUrl(channelId);

  const result =
    await telegramRequest<boolean>(
      botToken.trim(),
      "setWebhook",
      {
        url: webhookUrl,

        allowed_updates: [
          "message",
        ],
      }
    );

  return {
    success: result,
    webhookUrl,
  };
}

/*
|--------------------------------------------------------------------------
| Delete Webhook
|--------------------------------------------------------------------------
*/

export async function deleteTelegramWebhook(
  botToken: string
) {
  if (!botToken?.trim()) {
    throw new Error(
      "TELEGRAM_BOT_TOKEN_REQUIRED"
    );
  }

  const result =
    await telegramRequest<boolean>(
      botToken.trim(),
      "deleteWebhook",
      {
        drop_pending_updates: false,
      }
    );

  return {
    success: result,
  };
}

/*
|--------------------------------------------------------------------------
| Connect Telegram Bot
|--------------------------------------------------------------------------
*/

export async function connectTelegramBot(
  data: {
    tenantId: string;
    agentId: string;
    channelId: string;
    botToken: string;
    name?: string;
  }
) {
  const {
    tenantId,
    agentId,
    channelId,
    botToken,
    name,
  } = data;

  if (!tenantId) {
    throw new Error(
      "TENANT_ID_REQUIRED"
    );
  }

  if (!agentId) {
    throw new Error(
      "AGENT_ID_REQUIRED"
    );
  }

  if (!channelId) {
    throw new Error(
      "TELEGRAM_CHANNEL_ID_REQUIRED"
    );
  }

  if (!botToken?.trim()) {
    throw new Error(
      "TELEGRAM_BOT_TOKEN_REQUIRED"
    );
  }

  console.log(
    "TELEGRAM CONNECT: checking channel..."
  );

  const channel =
    await AgentChannel.findOne({
      where: {
        id: channelId,
        tenantId,
      },
    });

  if (!channel) {
    throw new Error(
      "TELEGRAM_CHANNEL_NOT_FOUND"
    );
  }

  console.log(
    "TELEGRAM CONNECT: channel found:",
    channel.id
  );

  if (channel.agentId !== agentId) {
    throw new Error(
      "TELEGRAM_AGENT_MISMATCH"
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Check Bot Token
  |--------------------------------------------------------------------------
  */

  console.log(
    "TELEGRAM CONNECT: checking Telegram bot..."
  );

  let bot: TelegramBotInfo;

  try {
    bot =
      await getTelegramBotInfo(
        botToken.trim()
      );
  } catch (error) {
    console.error(
      "TELEGRAM getMe ERROR:",
      error
    );

    throw new Error(
      error instanceof Error
        ? `TELEGRAM_GET_ME_FAILED:${error.message}`
        : "TELEGRAM_GET_ME_FAILED"
    );
  }

  console.log(
    "TELEGRAM CONNECT: bot found:",
    `@${bot.username}`
  );

  /*
  |--------------------------------------------------------------------------
  | Set Webhook
  |--------------------------------------------------------------------------
  */

  console.log(
    "TELEGRAM CONNECT: setting webhook..."
  );

  let webhook: {
    success: boolean;
    webhookUrl: string;
  };

  try {
    webhook =
      await setTelegramWebhook(
        botToken.trim(),
        channelId
      );
  } catch (error) {
    console.error(
      "TELEGRAM setWebhook ERROR:",
      error
    );

    throw new Error(
      error instanceof Error
        ? `TELEGRAM_SET_WEBHOOK_FAILED:${error.message}`
        : "TELEGRAM_SET_WEBHOOK_FAILED"
    );
  }

  console.log(
    "TELEGRAM CONNECT: webhook:",
    webhook.webhookUrl
  );

  /*
  |--------------------------------------------------------------------------
  | Save Channel
  |--------------------------------------------------------------------------
  */

  const currentConfig =
    (channel.config as Record<
      string,
      unknown
    > | null) || {};

  channel.config = {
    ...currentConfig,

    botToken:
      botToken.trim(),

    botId:
      bot.id,

    botUsername:
      bot.username,

    webhookUrl:
      webhook.webhookUrl,
  };

  channel.name =
    name?.trim() ||
    `Telegram @${bot.username}`;

  channel.type = "TELEGRAM";

  channel.isActive = true;

  await channel.save();

  console.log(
    "TELEGRAM CONNECT: channel activated successfully"
  );

  return {
    success: true,

    channel: {
      id: channel.id,
      tenantId:
        channel.tenantId,
      agentId:
        channel.agentId,
      type:
        channel.type,
      name:
        channel.name,
      isActive:
        channel.isActive,
    },

    bot: {
      id:
        bot.id,
      username:
        bot.username,
      firstName:
        bot.first_name,
    },

    webhook: {
      url:
        webhook.webhookUrl,
      active:
        webhook.success,
    },
  };
}

/*
|--------------------------------------------------------------------------
| Disconnect Telegram Bot
|--------------------------------------------------------------------------
*/

export async function disconnectTelegramBot(
  tenantId: string,
  channelId: string
) {
  const channel =
    await AgentChannel.findOne({
      where: {
        id: channelId,
        tenantId,
        type: "TELEGRAM",
      },
    });

  if (!channel) {
    throw new Error(
      "TELEGRAM_CHANNEL_NOT_FOUND"
    );
  }

  const botToken =
    getBotTokenFromChannel(
      channel
    );

  await deleteTelegramWebhook(
    botToken
  );

  const currentConfig =
    (channel.config as Record<
      string,
      unknown
    > | null) || {};

  const {
    botToken: _botToken,
    botId: _botId,
    botUsername:
      _botUsername,
    webhookUrl:
      _webhookUrl,
    ...safeConfig
  } = currentConfig;

  channel.config =
    safeConfig;

  channel.isActive =
    false;

  await channel.save();

  return {
    success: true,
    channelId:
      channel.id,
    isActive:
      false,
  };
}

/*
|--------------------------------------------------------------------------
| Send Telegram Message
|--------------------------------------------------------------------------
*/

export async function sendTelegramMessage(
  botToken: string,
  chatId: number | string,
  text: string
) {
  if (!botToken?.trim()) {
    throw new Error(
      "TELEGRAM_BOT_TOKEN_REQUIRED"
    );
  }

  if (
    chatId === undefined ||
    chatId === null ||
    chatId === ""
  ) {
    throw new Error(
      "TELEGRAM_CHAT_ID_REQUIRED"
    );
  }

  if (!text?.trim()) {
    throw new Error(
      "TELEGRAM_MESSAGE_REQUIRED"
    );
  }

  return telegramRequest(
    botToken.trim(),
    "sendMessage",
    {
      chat_id: chatId,
      text: text.trim(),
    }
  );
}

/*
|--------------------------------------------------------------------------
| Get Telegram Channel
|--------------------------------------------------------------------------
*/

export async function getTelegramChannel(
  tenantId: string,
  channelId: string
) {
  const channel =
    await AgentChannel.findOne({
      where: {
        id: channelId,
        tenantId,
        type: "TELEGRAM",
      },
    });

  if (!channel) {
    throw new Error(
      "TELEGRAM_CHANNEL_NOT_FOUND"
    );
  }

  const config =
    (channel.config as Record<
      string,
      unknown
    > | null) || {};

  return {
    id:
      channel.id,

    tenantId:
      channel.tenantId,

    agentId:
      channel.agentId,

    type:
      channel.type,

    name:
      channel.name,

    isActive:
      channel.isActive,

    bot: {
      id:
        typeof config.botId ===
        "number"
          ? config.botId
          : null,

      username:
        typeof config.botUsername ===
        "string"
          ? config.botUsername
          : null,
    },

    webhookUrl:
      typeof config.webhookUrl ===
      "string"
        ? config.webhookUrl
        : null,
  };
}

/*
|--------------------------------------------------------------------------
| Handle Telegram Webhook
|--------------------------------------------------------------------------
*/

export async function handleTelegramWebhook(
  channelId: string,
  update: TelegramUpdate
) {
  if (!channelId) {
    throw new Error(
      "TELEGRAM_CHANNEL_ID_REQUIRED"
    );
  }

  if (!update) {
    throw new Error(
      "TELEGRAM_UPDATE_REQUIRED"
    );
  }

  if (!update.message) {
    return {
      success: true,
      ignored: true,
      reason:
        "NO_MESSAGE",
    };
  }

  const message =
    update.message;

  if (!message.text?.trim()) {
    return {
      success: true,
      ignored: true,
      reason:
        "NON_TEXT_MESSAGE",
    };
  }

  return {
    success: true,

    ignored: false,

    channelId,

    updateId:
      update.update_id,

    telegram: {
      messageId:
        message.message_id,

      chatId:
        message.chat.id,

      text:
        message.text.trim(),

      user:
        message.from
          ? {
              id:
                message.from.id,

              username:
                message.from
                  .username ||
                null,

              firstName:
                message.from
                  .first_name ||
                null,

              lastName:
                message.from
                  .last_name ||
                null,
            }
          : null,
    },
  };
}