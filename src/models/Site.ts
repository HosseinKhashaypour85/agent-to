import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export type SiteStatus =
  | "INSTALLING"
  | "ACTIVE"
  | "INACTIVE";

interface SiteAttributes {
  id: string;
  tenantId: string;
  siteId: string;
  domain: string;
  name: string;
  status: SiteStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SiteCreationAttributes
  extends Optional<
    SiteAttributes,
    "id" | "status" | "createdAt" | "updatedAt"
  > {}

class Site
  extends Model<SiteAttributes, SiteCreationAttributes>
  implements SiteAttributes
{
  declare id: string;
  declare tenantId: string;
  declare siteId: string;
  declare domain: string;
  declare name: string;
  declare status: SiteStatus;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Site.init(
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

    siteId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    domain: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        "INSTALLING",
        "ACTIVE",
        "INACTIVE"
      ),
      allowNull: false,
      defaultValue: "INSTALLING",
    },
  },
  {
    sequelize,
    tableName: "sites",
    modelName: "Site",
    timestamps: true,
  }
);

export default Site;