import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";

import { sequelize } from "../config/database";

interface CustomerMemoryAttributes {
  id: string;
  tenantId: string;
  customerId: string;
  key: string;
  value: string;
  source: string;
  confidence: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CustomerMemoryCreationAttributes
  extends Optional<
    CustomerMemoryAttributes,
    | "id"
    | "source"
    | "confidence"
    | "createdAt"
    | "updatedAt"
  > {}

class CustomerMemory
  extends Model<
    CustomerMemoryAttributes,
    CustomerMemoryCreationAttributes
  >
  implements CustomerMemoryAttributes
{
  declare id: string;
  declare tenantId: string;
  declare customerId: string;
  declare key: string;
  declare value: string;
  declare source: string;
  declare confidence: number;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

CustomerMemory.init(
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

    key: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },

    value: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },

    source: {
      type: DataTypes.STRING(191),
      allowNull: false,
      defaultValue: "AI",
    },

    confidence: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 1.0,
    },
  },
  {
    sequelize,
    tableName: "customer_memories",
    modelName: "CustomerMemory",
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
        fields: ["tenantId", "customerId", "key"],
        name: "unique_tenant_customer_key",
      },
    ],
  }
);

export default CustomerMemory;