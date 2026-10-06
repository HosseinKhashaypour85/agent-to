import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";

import { sequelize } from "../config/database";

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "PROPOSAL"
  | "WON"
  | "LOST";

export type LeadSource =
  | "WEBSITE"
  | "WORDPRESS"
  | "TELEGRAM"
  | "WHATSAPP"
  | "MANUAL"
  | "AI";

interface LeadAttributes {
  id: string;
  tenantId: string;
  customerId: string;

  title: string;
  description: string | null;

  status: LeadStatus;
  source: LeadSource;

  value: number | null;

  assignedTo: string | null;

  expectedCloseDate: Date | null;

  notes: string | null;

  createdAt?: Date;
  updatedAt?: Date;
}

interface LeadCreationAttributes
  extends Optional<
    LeadAttributes,
    | "id"
    | "description"
    | "status"
    | "source"
    | "value"
    | "assignedTo"
    | "expectedCloseDate"
    | "notes"
    | "createdAt"
    | "updatedAt"
  > {}

class Lead
  extends Model<
    LeadAttributes,
    LeadCreationAttributes
  >
  implements LeadAttributes
{
  declare id: string;
  declare tenantId: string;
  declare customerId: string;

  declare title: string;
  declare description: string | null;

  declare status: LeadStatus;
  declare source: LeadSource;

  declare value: number | null;

  declare assignedTo: string | null;

  declare expectedCloseDate: Date | null;

  declare notes: string | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static associate(models: any) {
    Lead.hasMany(models.LeadScore, {
      foreignKey: "leadId",
      as: "scores",
    });
  }
}

Lead.init(
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

    customerId: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM(
        "NEW",
        "CONTACTED",
        "QUALIFIED",
        "PROPOSAL",
        "WON",
        "LOST"
      ),
      allowNull: false,
      defaultValue: "NEW",
    },

    source: {
      type: DataTypes.ENUM(
        "WEBSITE",
        "WORDPRESS",
        "TELEGRAM",
        "WHATSAPP",
        "MANUAL",
        "AI"
      ),
      allowNull: false,
      defaultValue: "MANUAL",
    },

    value: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },

    assignedTo: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },

    expectedCloseDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "leads",
    modelName: "Lead",
    timestamps: true,
  }
);

export default Lead;