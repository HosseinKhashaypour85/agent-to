import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

interface BusinessOwnerAttributes {
  id: string;
  tenantId: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BusinessOwnerCreationAttributes
  extends Optional<
    BusinessOwnerAttributes,
    "id" | "createdAt" | "updatedAt"
  > {}

class BusinessOwner
  extends Model<
    BusinessOwnerAttributes,
    BusinessOwnerCreationAttributes
  >
  implements BusinessOwnerAttributes
{
  declare id: string;
  declare tenantId: string;
  declare userId: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

BusinessOwner.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: undefined,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: undefined,
    },
  },
  {
    sequelize,
    tableName: "business_owners",
    modelName: "BusinessOwner",
    timestamps: true,
  }
);

export default BusinessOwner;