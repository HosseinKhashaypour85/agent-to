import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

interface SubscriptionAttributes {
  id: string;
  tenantId: string;
  planId: string;

  status:
    | "ACTIVE"
    | "EXPIRED"
    | "SUSPENDED"
    | "CANCELLED";

  startsAt: Date;
  expiresAt: Date;
  startedAt: Date;
  cancelledAt: Date | null;

  createdAt?: Date;
  updatedAt?: Date;
}

interface SubscriptionCreationAttributes
  extends Optional<
    SubscriptionAttributes,
    | "id"
    | "startedAt"
    | "cancelledAt"
    | "createdAt"
    | "updatedAt"
  > {}

class Subscription
  extends Model<
    SubscriptionAttributes,
    SubscriptionCreationAttributes
  >
  implements SubscriptionAttributes
{
  declare id: string;
  declare tenantId: string;
  declare planId: string;

  declare status:
    | "ACTIVE"
    | "EXPIRED"
    | "SUSPENDED"
    | "CANCELLED";

  declare startsAt: Date;
  declare expiresAt: Date;
  declare startedAt: Date;
  declare cancelledAt: Date | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Subscription.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    planId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        "ACTIVE",
        "EXPIRED",
        "SUSPENDED",
        "CANCELLED"
      ),
      allowNull: false,
      defaultValue: "ACTIVE",
    },

    startsAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    startedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "subscriptions",
    modelName: "Subscription",
    timestamps: true,
  }
);

export default Subscription;
