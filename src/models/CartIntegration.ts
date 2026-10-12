import { DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "../config/database";

export type CartEndpoint = {
  key: string;
  label: string;
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  enabled: boolean;
  payload?: string;
};

class CartIntegration extends Model<InferAttributes<CartIntegration>, InferCreationAttributes<CartIntegration>> {
  declare id: string;
  declare tenantId: string;
  declare siteId: string;
  declare endpoints: CartEndpoint[];
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

CartIntegration.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  tenantId: { type: DataTypes.UUID, allowNull: false },
  siteId: { type: DataTypes.UUID, allowNull: false, unique: true },
  endpoints: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
  createdAt: { type: DataTypes.DATE, allowNull: false },
  updatedAt: { type: DataTypes.DATE, allowNull: false },
}, { sequelize, tableName: "cart_integrations", timestamps: true });

export default CartIntegration;
