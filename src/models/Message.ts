import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";

import { sequelize } from "../config/database";

export type MessageSender =
  | "USER"
  | "AI"
  | "AGENT"
  | "SYSTEM";

export type MessageType =
  | "TEXT"
  | "IMAGE"
  | "FILE";

interface MessageAttributes {
  id: string;
  tenantId: string;
  conversationId: string;

  sender: MessageSender;
  content: string;
  messageType: MessageType;

  createdAt?: Date;
  updatedAt?: Date;
}

interface MessageCreationAttributes
  extends Optional<
    MessageAttributes,
    | "id"
    | "messageType"
    | "createdAt"
    | "updatedAt"
  > {}

class Message
  extends Model<
    MessageAttributes,
    MessageCreationAttributes
  >
  implements MessageAttributes
{
  declare id: string;
  declare tenantId: string;
  declare conversationId: string;

  declare sender: MessageSender;
  declare content: string;
  declare messageType: MessageType;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Message.init(
  {
    id: {
      type: DataTypes.STRING(191),
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },

    tenantId: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },

    conversationId: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },

    sender: {
      type: DataTypes.ENUM(
        "USER",
        "AI",
        "AGENT",
        "SYSTEM"
      ),
      allowNull: false,
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    messageType: {
      type: DataTypes.ENUM(
        "TEXT",
        "IMAGE",
        "FILE"
      ),
      allowNull: false,
      defaultValue: "TEXT",
    },
  },
  {
    sequelize,
    tableName: "messages",
    modelName: "Message",
    timestamps: true,

    indexes: [
      {
        fields: ["tenantId"],
      },
      {
        fields: ["tenantId", "conversationId"],
      },
      {
        fields: ["conversationId", "createdAt"],
      },
      {
        fields: ["createdAt"],
      },
    ],
  }
);

export default Message;