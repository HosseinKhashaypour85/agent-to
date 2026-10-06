import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";

import { sequelize } from "../config/database";

export type SubscriptionPlanStatus =
  | "ACTIVE"
  | "INACTIVE";

interface SubscriptionPlanAttributes {
  id: string;
  name: string;
  slug: string;

  description?: string | null;

  price: number;
  currency: string;

  billingInterval:
    | "MONTHLY"
    | "YEARLY";

  maxCustomers: number;
  maxLeads: number;
  maxProducts: number;
  maxKnowledgeItems: number;
  maxAgents: number;
  maxChannels: number;

  maxAiMessages: number;
  maxAiRequests: number;

  features?: Record<
    string,
    unknown
  > | null;

  status:
    SubscriptionPlanStatus;

  isPopular: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

interface SubscriptionPlanCreationAttributes
  extends Optional<
    SubscriptionPlanAttributes,
    | "id"
    | "description"
    | "currency"
    | "billingInterval"
    | "maxCustomers"
    | "maxLeads"
    | "maxProducts"
    | "maxKnowledgeItems"
    | "maxAgents"
    | "maxChannels"
    | "maxAiMessages"
    | "maxAiRequests"
    | "features"
    | "status"
    | "isPopular"
    | "createdAt"
    | "updatedAt"
  > {}

class SubscriptionPlan
  extends Model<
    SubscriptionPlanAttributes,
    SubscriptionPlanCreationAttributes
  >
  implements SubscriptionPlanAttributes
{
  declare id: string;

  declare name: string;

  declare slug: string;

  declare description:
    | string
    | null;

  declare price: number;

  declare currency: string;

  declare billingInterval:
    | "MONTHLY"
    | "YEARLY";

  declare maxCustomers: number;

  declare maxLeads: number;

  declare maxProducts: number;

  declare maxKnowledgeItems: number;

  declare maxAgents: number;

  declare maxChannels: number;

  declare maxAiMessages: number;

  declare maxAiRequests: number;

  declare features:
    | Record<string, unknown>
    | null;

  declare status:
    SubscriptionPlanStatus;

  declare isPopular: boolean;

  declare readonly createdAt: Date;

  declare readonly updatedAt: Date;
}

SubscriptionPlan.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue:
        DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },

    slug: {
      type: DataTypes.STRING(191),
      allowNull: false,
      unique: true,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    price: {
      type: DataTypes.DECIMAL(
        15,
        2
      ),
      allowNull: false,
      defaultValue: 0,
    },

    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "USD",
    },

    billingInterval: {
      type: DataTypes.ENUM(
        "MONTHLY",
        "YEARLY"
      ),
      allowNull: false,
      defaultValue: "MONTHLY",
    },

    maxCustomers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
    },

    maxLeads: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
    },

    maxProducts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
    },

    maxKnowledgeItems: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
    },

    maxAgents: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    maxChannels: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2,
    },

    maxAiMessages: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1000,
    },

    maxAiRequests: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1000,
    },

    features: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM(
        "ACTIVE",
        "INACTIVE"
      ),
      allowNull: false,
      defaultValue: "ACTIVE",
    },

    isPopular: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },

  {
    sequelize,

    tableName:
      "subscription_plans",

    timestamps: true,

    indexes: [
      {
        unique: true,
        fields: ["slug"],
      },
    ],
  }
);

export default SubscriptionPlan;