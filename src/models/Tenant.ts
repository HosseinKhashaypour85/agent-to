import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

interface TenantAttributes {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  status: "ACTIVE" | "SUSPENDED" | "DEACTIVATED";
  createdAt?: Date;
  updatedAt?: Date;
}

interface TenantCreationAttributes
  extends Optional<
    TenantAttributes,
    "id" | "phone" | "status" | "createdAt" | "updatedAt"
  > {}

class Tenant
  extends Model<TenantAttributes, TenantCreationAttributes>
  implements TenantAttributes
{
  declare id: string;
  declare name: string;
  declare slug: string;
  declare email: string;
  declare phone: string | null;
  declare status: "ACTIVE" | "SUSPENDED" | "DEACTIVATED";

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Tenant.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    slug: {
      type: DataTypes.STRING(191),
      allowNull: false,
      unique: true,
    },

    email: {
      type: DataTypes.STRING(191),
      allowNull: false,
      unique: true,
    },

    phone: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("ACTIVE", "SUSPENDED", "DEACTIVATED"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
  },
  {
    sequelize,
    tableName: "tenants",
    modelName: "Tenant",
    timestamps: true,
  }
);

export default Tenant;