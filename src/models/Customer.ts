import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";

import { sequelize } from "../config/database";

interface CustomerAttributes {
  id: string;
  tenantId: string;
  telegramId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string | null;
  referralCode: string;
  referredBy: string | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CustomerCreationAttributes
  extends Optional<
    CustomerAttributes,
    | "id"
    | "telegramId"
    | "username"
    | "firstName"
    | "lastName"
    | "phone"
    | "email"
    | "referralCode"
    | "referredBy"
    | "isActive"
    | "createdAt"
    | "updatedAt"
  > {}

class Customer
  extends Model<
    CustomerAttributes,
    CustomerCreationAttributes
  >
  implements CustomerAttributes
{
  declare id: string;
  declare tenantId: string;
  declare telegramId: string;
  declare username: string | null;
  declare firstName: string | null;
  declare lastName: string | null;
  declare phone: string | null;
  declare email: string | null;
  declare referralCode: string;
  declare referredBy: string | null;
  declare isActive: boolean;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static associate(models: any) {
    Customer.hasMany(models.LeadScore, {
      foreignKey: "customerId",
      as: "leadScores",
    });
    Customer.hasMany(models.Lead, {
      foreignKey: "customerId",
      as: "leads",
    });
    Customer.hasMany(models.Conversation, {
      foreignKey: "customerId",
      as: "conversations",
    });
    Customer.hasMany(models.CustomerMemory, {
      foreignKey: "customerId",
      as: "memories",
    });
  }
}

Customer.init(
  {
    id: {
      type: DataTypes.STRING(191),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    tenantId: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },

    telegramId: {
      type: DataTypes.STRING(191),
      allowNull: false,
      defaultValue: "",
    },

    username: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },

    firstName: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },

    lastName: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },

    phone: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },

    email: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },

    referralCode: {
      type: DataTypes.STRING(191),
      allowNull: false,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },

    referredBy: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "customers",
    modelName: "Customer",
    timestamps: true,

    tableOptions: {
      collate: "utf8mb4_0900_ai_ci",
    },

    indexes: [
      {
        fields: ["tenantId"],
      },
      {
        fields: ["tenantId", "phone"],
      },
      {
        fields: ["tenantId", "email"],
      },
    ],
  }
);

export default Customer;
