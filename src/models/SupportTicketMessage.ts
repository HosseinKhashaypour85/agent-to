import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export type SupportMessageSenderType = "CUSTOMER" | "SUPPORT";
interface SupportTicketMessageAttributes {
  id: string;
  ticketId: string;
  tenantId: string;
  senderUserId: string;
  senderType: SupportMessageSenderType;
  message: string;
  createdAt?: Date;
  updatedAt?: Date;
}
interface SupportTicketMessageCreationAttributes extends Optional<SupportTicketMessageAttributes, "id" | "createdAt" | "updatedAt"> {}

class SupportTicketMessage extends Model<SupportTicketMessageAttributes, SupportTicketMessageCreationAttributes>
  implements SupportTicketMessageAttributes {
  declare id: string;
  declare ticketId: string;
  declare tenantId: string;
  declare senderUserId: string;
  declare senderType: SupportMessageSenderType;
  declare message: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

SupportTicketMessage.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  ticketId: { type: DataTypes.UUID, allowNull: false },
  tenantId: { type: DataTypes.STRING(191), allowNull: false },
  senderUserId: { type: DataTypes.STRING(191), allowNull: false },
  senderType: { type: DataTypes.ENUM("CUSTOMER", "SUPPORT"), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
}, {
  sequelize,
  tableName: "support_ticket_messages",
  modelName: "SupportTicketMessage",
  timestamps: true,
  indexes: [
    { fields: ["ticketId", "createdAt"] },
    { fields: ["tenantId", "createdAt"] },
  ],
});

export default SupportTicketMessage;
