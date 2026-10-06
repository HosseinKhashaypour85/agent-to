import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export type ProductSource =
  | "WOOCOMMERCE"
  | "CUSTOM_API"
  | "CUSTOM_ENDPOINT"
  | "MANUAL";

export type ProductStockStatus =
  | "IN_STOCK"
  | "OUT_OF_STOCK"
  | "LOW_STOCK"
  | "UNKNOWN";

interface ProductAttributes {
  id: string;
  tenantId: string;

  externalId: string | null;
  name: string;
  sku: string | null;
  description: string | null;

  price: number | null;
  compareAtPrice: number | null;
  currency: string;

  stock: number | null;
  stockStatus: ProductStockStatus;

  category: string | null;
  imageUrl: string | null;
  productUrl: string | null;

  source: ProductSource;
  sourceType: ProductSource;

  isActive: boolean;
  lastSyncedAt: Date | null;
  rawData: object | null;

  createdAt?: Date;
  updatedAt?: Date;
}

interface ProductCreationAttributes
  extends Optional<
    ProductAttributes,
    | "id"
    | "externalId"
    | "sku"
    | "description"
    | "price"
    | "compareAtPrice"
    | "currency"
    | "stock"
    | "stockStatus"
    | "category"
    | "imageUrl"
    | "productUrl"
    | "source"
    | "sourceType"
    | "isActive"
    | "lastSyncedAt"
    | "rawData"
    | "createdAt"
    | "updatedAt"
  > {}

class Product
  extends Model<ProductAttributes, ProductCreationAttributes>
  implements ProductAttributes
{
  declare id: string;
  declare tenantId: string;

  declare externalId: string | null;
  declare name: string;
  declare sku: string | null;
  declare description: string | null;

  declare price: number | null;
  declare compareAtPrice: number | null;
  declare currency: string;

  declare stock: number | null;
  declare stockStatus: ProductStockStatus;

  declare category: string | null;
  declare imageUrl: string | null;
  declare productUrl: string | null;

  declare source: ProductSource;
  declare sourceType: ProductSource;

  declare isActive: boolean;
  declare lastSyncedAt: Date | null;
  declare rawData: object | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Product.init(
  {
    id: {
      type: DataTypes.STRING(191),
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },

    tenantId: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },

    externalId: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },

    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    sku: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },

    compareAtPrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },

    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "IRR",
    },

    stock: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    stockStatus: {
      type: DataTypes.ENUM(
        "IN_STOCK",
        "OUT_OF_STOCK",
        "LOW_STOCK",
        "UNKNOWN"
      ),
      allowNull: false,
      defaultValue: "UNKNOWN",
    },

    category: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },

    imageUrl: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },

    productUrl: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },

    source: {
      type: DataTypes.ENUM(
        "WOOCOMMERCE",
        "CUSTOM_API",
        "CUSTOM_ENDPOINT",
        "MANUAL"
      ),
      allowNull: false,
      defaultValue: "MANUAL",
    },

    sourceType: {
      type: DataTypes.ENUM(
        "WOOCOMMERCE",
        "CUSTOM_API",
        "CUSTOM_ENDPOINT",
        "MANUAL"
      ),
      allowNull: false,
      defaultValue: "MANUAL",
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    lastSyncedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    rawData: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
 {
  sequelize,
  tableName: "agent_products",
  modelName: "Product",
  timestamps: true,
}
);

export default Product;