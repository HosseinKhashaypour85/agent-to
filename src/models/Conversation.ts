import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";

import { sequelize } from "../config/database";

export type ConversationChannel =
  | "WEBSITE"
  | "WORDPRESS"
  | "TELEGRAM"
  | "WHATSAPP";

export type ConversationStatus =
  | "OPEN"
  | "CLOSED";

interface ConversationAttributes {
  id: string;
  tenantId: string;
  customerId: string;

  channel: ConversationChannel;
  status: ConversationStatus;

  createdAt?: Date;
  updatedAt?: Date;
}

interface ConversationCreationAttributes
  extends Optional<
    ConversationAttributes,
    | "id"
    | "status"
    | "createdAt"
    | "updatedAt"
  > {}

class Conversation
  extends Model<
    ConversationAttributes,
    ConversationCreationAttributes
  >
  implements ConversationAttributes
{
  declare id: string;
  declare tenantId: string;
  declare customerId: string;

  declare channel: ConversationChannel;
  declare status: ConversationStatus;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Conversation.init(
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

    customerId: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },

    channel: {
      type: DataTypes.ENUM(
        "WEBSITE",
        "WORDPRESS",
        "TELEGRAM",
        "WHATSAPP"
      ),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        "OPEN",
        "CLOSED"
      ),
      allowNull: false,
      defaultValue: "OPEN",
    },
  },
  {
    sequelize,
    tableName: "conversations",
    modelName: "Conversation",
    timestamps: true,

    indexes: [
      {
        fields: ["tenantId"],
      },
      {
        fields: ["tenantId", "customerId"],
      },
      {
        fields: ["tenantId", "status"],
      },
      {
        fields: ["createdAt"],
      },
    ],
  }
);

export default Conversation;