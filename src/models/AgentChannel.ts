import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";

import { sequelize } from "../config/database";

export type ChannelType =
  | "WEBSITE"
  | "WORDPRESS"
  | "TELEGRAM"
  | "WHATSAPP";

class AgentChannel extends Model<
  InferAttributes<AgentChannel>,
  InferCreationAttributes<AgentChannel>
> {
  declare id: string;
  declare tenantId: string;
  declare agentId: string;

  declare type: ChannelType;
  declare name: string;

  declare isActive: boolean;

  declare config: object | null;

  declare createdAt?: Date;
  declare updatedAt?: Date;
}

AgentChannel.init(
  {
    id: {
      type: DataTypes.STRING(191),
      primaryKey: true,
      allowNull: false,
    },

    tenantId: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },

    agentId: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM(
        "WEBSITE",
        "WORDPRESS",
        "TELEGRAM",
        "WHATSAPP"
      ),
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    config: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    createdAt: {
      type: DataTypes.DATE(3),
      allowNull: false,
    },

    updatedAt: {
      type: DataTypes.DATE(3),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "agent_channels",
    modelName: "AgentChannel",
    timestamps: true,
    indexes: [
      {
        fields: ["tenantId"],
      },
      {
        fields: ["agentId"],
      },
      {
        unique: true,
        fields: ["agentId", "type"],
      },
    ],
  }
);

export default AgentChannel;