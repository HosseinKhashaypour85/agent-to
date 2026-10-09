import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export type UsageSource = "LLM" | "KNOWLEDGE_BASE";

interface UsageRecordAttributes {
  id: string;
  tenantId: string;
  conversationId: string;
  source: UsageSource;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  aiMessages: number;
  usageAvailable: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UsageRecordCreationAttributes
  extends Optional<
    UsageRecordAttributes,
    | "id"
    | "inputTokens"
    | "outputTokens"
    | "totalTokens"
    | "aiMessages"
    | "usageAvailable"
    | "createdAt"
    | "updatedAt"
  > {}

class UsageRecord
  extends Model<
    UsageRecordAttributes,
    UsageRecordCreationAttributes
  >
  implements UsageRecordAttributes
{
  declare id: string;
  declare tenantId: string;
  declare conversationId: string;
  declare source: UsageSource;
  declare model: string;
  declare inputTokens: number;
  declare outputTokens: number;
  declare totalTokens: number;
  declare aiMessages: number;
  declare usageAvailable: boolean;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

UsageRecord.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    tenantId: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },

    conversationId: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },

    source: {
      type: DataTypes.ENUM("LLM", "KNOWLEDGE_BASE"),
      allowNull: false,
    },

    model: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },

    inputTokens: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },

    outputTokens: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },

    totalTokens: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },

    aiMessages: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
    },

    usageAvailable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "usage_records",
    modelName: "UsageRecord",
    timestamps: true,
    indexes: [
      {
        fields: ["tenantId", "createdAt"],
      },
      {
        fields: ["conversationId"],
      },
      {
        fields: ["createdAt"],
      },
    ],
  }
);

export default UsageRecord;