import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";

import { sequelize } from "../config/database";

export type InstallationStatus =
  | "PENDING"
  | "INSTALLED"
  | "EXPIRED"
  | "REVOKED";

interface InstallationAttributes {
  id: string;
  siteId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  status: InstallationStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

interface InstallationCreationAttributes
  extends Optional<
    InstallationAttributes,
    | "id"
    | "usedAt"
    | "status"
    | "createdAt"
    | "updatedAt"
  > {}

class Installation
  extends Model<
    InstallationAttributes,
    InstallationCreationAttributes
  >
  implements InstallationAttributes
{
  declare id: string;
  declare siteId: string;
  declare tokenHash: string;
  declare expiresAt: Date;
  declare usedAt: Date | null;
  declare status: InstallationStatus;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Installation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    siteId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    tokenHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },

    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    usedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM(
        "PENDING",
        "INSTALLED",
        "EXPIRED",
        "REVOKED"
      ),
      allowNull: false,
      defaultValue: "PENDING",
    },
  },
  {
    sequelize,
    tableName: "installations",
    modelName: "Installation",
    timestamps: true,
  }
);

export default Installation;