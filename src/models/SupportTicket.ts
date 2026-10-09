import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export type SupportTicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "WAITING_CUSTOMER"
  | "ANSWERED"
  | "CLOSED";
export type SupportTicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

interface SupportTicketAttributes {
  id: string;
  tenantId: string;
  createdByUserId: string;
  subject: string;
  category: string;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  lastMessageAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SupportTicketCreationAttributes extends Optional<SupportTicketAttributes,
  "id" | "priority" | "status" | "lastMessageAt" | "createdAt" | "updatedAt"> {}

class SupportTicket extends Model<SupportTicketAttributes, SupportTicketCreationAttributes>
  implements SupportTicketAttributes {
  declare id: string;
  declare tenantId: string;
  declare createdByUserId: string;
  declare subject: string;
  declare category: string;
  declare priority: SupportTicketPriority;
  declare status: SupportTicketStatus;
  declare lastMessageAt: Date;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

SupportTicket.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  tenantId: { type: DataTypes.STRING(191), allowNull: false },
  createdByUserId: { type: DataTypes.STRING(191), allowNull: false },
  subject: { type: DataTypes.STRING(191), allowNull: false },
  category: { type: DataTypes.STRING(100), allowNull: false, defaultValue: "GENERAL" },
  priority: { type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH", "URGENT"), allowNull: false, defaultValue: "MEDIUM" },
  status: { type: DataTypes.ENUM("OPEN", "IN_PROGRESS", "WAITING_CUSTOMER", "ANSWERED", "CLOSED"), allowNull: false, defaultValue: "OPEN" },
  lastMessageAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  sequelize,
  tableName: "support_tickets",
  modelName: "SupportTicket",
  timestamps: true,
  indexes: [
    { fields: ["tenantId", "createdAt"] },
    { fields: ["status", "priority"] },
    { fields: ["lastMessageAt"] },
  ],
});

export default SupportTicket;
