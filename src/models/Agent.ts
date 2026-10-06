import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";

import { sequelize } from "../config/database";

class Agent extends Model<
  InferAttributes<Agent>,
  InferCreationAttributes<Agent>
> {
  declare id: string;
  declare tenantId: string;
  declare name: string;
  declare description: string | null;

  declare systemPrompt: string;

  declare language: string;
  declare tone: string;

  declare isActive: boolean;

  declare createdAt?: Date;
  declare updatedAt?: Date;
}

Agent.init(
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

    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "AI Agent",
    },

    description: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },

    systemPrompt: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue:
        "شما دستیار هوشمند کسب‌وکار هستید. پاسخ‌ها را دقیق، مفید و محترمانه ارائه دهید.",
    },

    language: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "fa",
    },

    tone: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "friendly",
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: "agents",
    timestamps: true,
    indexes: [
      {
        fields: ["tenantId"],
      },
    ],
  }
);

export default Agent;