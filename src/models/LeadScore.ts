import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";

import { sequelize } from "../config/database";

export type LeadTemperature =
  | "COLD"
  | "WARM"
  | "HOT";

interface LeadScoreAttributes {
  id: string;
  tenantId: string;
  customerId: string;
  leadId: string | null;
  score: number;
  temperature: LeadTemperature;
  reasons: string[];
  signals: Record<string, number>;
  aiAnalysis: string | null;
  lastCalculatedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LeadScoreCreationAttributes
  extends Optional<
    LeadScoreAttributes,
    | "id"
    | "leadId"
    | "reasons"
    | "signals"
    | "aiAnalysis"
    | "createdAt"
    | "updatedAt"
  > {}

class LeadScore
  extends Model<
    LeadScoreAttributes,
    LeadScoreCreationAttributes
  >
  implements LeadScoreAttributes
{
  declare id: string;
  declare tenantId: string;
  declare customerId: string;
  declare leadId: string | null;
  declare score: number;
  declare temperature: LeadTemperature;
  declare reasons: string[];
  declare signals: Record<string, number>;
  declare aiAnalysis: string | null;
  declare lastCalculatedAt: Date;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static associate(models: any) {
    LeadScore.belongsTo(models.Customer, {
      foreignKey: "customerId",
      as: "customer",
    });
    LeadScore.belongsTo(models.Lead, {
      foreignKey: "leadId",
      as: "lead",
    });
  }
}

LeadScore.init(
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

    leadId: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },

    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    temperature: {
      type: DataTypes.ENUM("COLD", "WARM", "HOT"),
      allowNull: false,
      defaultValue: "COLD",
    },

    reasons: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },

    signals: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },

    aiAnalysis: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },

    lastCalculatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "lead_scores",
    modelName: "LeadScore",
    timestamps: true,

    indexes: [
      {
        fields: ["tenantId"],
      },
      {
        fields: ["tenantId", "customerId"],
      },
      {
        unique: true,
        fields: ["tenantId", "customerId"],
        name: "unique_tenant_customer",
      },
      {
        fields: ["score"],
      },
      {
        fields: ["temperature"],
      },
      {
        fields: ["lastCalculatedAt"],
      },
    ],
  }
);

export default LeadScore;