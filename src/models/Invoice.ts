import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export type InvoiceStatus =
  | "DRAFT"
  | "ISSUED"
  | "UNPAID"
  | "PARTIALLY_PAID"
  | "PAID"
  | "VOID"
  | "REFUNDED";

export type InvoiceSource = "WOOCOMMERCE" | "CUSTOM" | "MANUAL";

export interface InvoiceItemSnapshot {
  productId?: string | null;
  sku?: string | null;
  name: string;
  quantity: number;
  unitPrice: string;
  discountAmount: string;
  taxAmount: string;
  lineTotal: string;
  metadata?: Record<string, unknown>;
}

export interface InvoicePartySnapshot {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  taxId?: string | null;
  nationalId?: string | null;
}

interface InvoiceAttributes {
  id: string;
  tenantId: string;
  siteId: string | null;
  customerId: string | null;
  invoiceNumber: string;
  orderId: string | null;
  externalOrderId: string | null;
  source: InvoiceSource;
  status: InvoiceStatus;
  currency: string;
  subtotal: string;
  discountTotal: string;
  taxTotal: string;
  shippingTotal: string;
  grandTotal: string;
  paidTotal: string;
  items: InvoiceItemSnapshot[];
  sellerSnapshot: InvoicePartySnapshot;
  buyerSnapshot: InvoicePartySnapshot;
  notes: string | null;
  issuedAt: Date | null;
  paidAt: Date | null;
  pdfStorageKey: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type InvoiceCreationAttributes = Optional<
  InvoiceAttributes,
  | "id"
  | "siteId"
  | "customerId"
  | "orderId"
  | "externalOrderId"
  | "source"
  | "status"
  | "currency"
  | "subtotal"
  | "discountTotal"
  | "taxTotal"
  | "shippingTotal"
  | "grandTotal"
  | "paidTotal"
  | "items"
  | "sellerSnapshot"
  | "buyerSnapshot"
  | "notes"
  | "issuedAt"
  | "paidAt"
  | "pdfStorageKey"
  | "createdAt"
  | "updatedAt"
>;

class Invoice extends Model<InvoiceAttributes, InvoiceCreationAttributes> implements InvoiceAttributes {
  declare id: string;
  declare tenantId: string;
  declare siteId: string | null;
  declare customerId: string | null;
  declare invoiceNumber: string;
  declare orderId: string | null;
  declare externalOrderId: string | null;
  declare source: InvoiceSource;
  declare status: InvoiceStatus;
  declare currency: string;
  declare subtotal: string;
  declare discountTotal: string;
  declare taxTotal: string;
  declare shippingTotal: string;
  declare grandTotal: string;
  declare paidTotal: string;
  declare items: InvoiceItemSnapshot[];
  declare sellerSnapshot: InvoicePartySnapshot;
  declare buyerSnapshot: InvoicePartySnapshot;
  declare notes: string | null;
  declare issuedAt: Date | null;
  declare paidAt: Date | null;
  declare pdfStorageKey: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Invoice.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    tenantId: { type: DataTypes.STRING(191), allowNull: false },
    siteId: { type: DataTypes.STRING(191), allowNull: true },
    customerId: { type: DataTypes.STRING(191), allowNull: true },
    invoiceNumber: { type: DataTypes.STRING(64), allowNull: false },
    orderId: { type: DataTypes.STRING(191), allowNull: true },
    externalOrderId: { type: DataTypes.STRING(191), allowNull: true },
    source: {
      type: DataTypes.ENUM("WOOCOMMERCE", "CUSTOM", "MANUAL"),
      allowNull: false,
      defaultValue: "CUSTOM",
    },
    status: {
      type: DataTypes.ENUM("DRAFT", "ISSUED", "UNPAID", "PARTIALLY_PAID", "PAID", "VOID", "REFUNDED"),
      allowNull: false,
      defaultValue: "ISSUED",
    },
    currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: "IRR" },
    subtotal: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: "0.00" },
    discountTotal: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: "0.00" },
    taxTotal: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: "0.00" },
    shippingTotal: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: "0.00" },
    grandTotal: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: "0.00" },
    paidTotal: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: "0.00" },
    items: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    sellerSnapshot: { type: DataTypes.JSON, allowNull: false },
    buyerSnapshot: { type: DataTypes.JSON, allowNull: false },
    notes: { type: DataTypes.TEXT, allowNull: true },
    issuedAt: { type: DataTypes.DATE, allowNull: true },
    paidAt: { type: DataTypes.DATE, allowNull: true },
    pdfStorageKey: { type: DataTypes.STRING(512), allowNull: true },
  },
  {
    sequelize,
    tableName: "invoices",
    modelName: "Invoice",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["tenantId", "invoiceNumber"] },
      { fields: ["tenantId", "createdAt"] },
      { fields: ["tenantId", "customerId"] },
      { fields: ["tenantId", "siteId"] },
      { fields: ["tenantId", "status"] },
      { fields: ["tenantId", "orderId"] },
      { fields: ["tenantId", "externalOrderId"] },
    ],
  }
);

export default Invoice;
