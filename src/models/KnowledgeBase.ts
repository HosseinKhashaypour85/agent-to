import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export type KnowledgeType =
  | "TEXT"
  | "FAQ"
  | "PRODUCT"
  | "DOCUMENT"
  | "URL";

interface KnowledgeBaseAttributes {
  id: string;
  tenantId: string;
  title: string;
  content: string;
  type: KnowledgeType;
  source: string | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface KnowledgeBaseCreationAttributes
  extends Optional<
    KnowledgeBaseAttributes,
    "id" | "source" | "isActive" | "createdAt" | "updatedAt"
  > {}

class KnowledgeBase
  extends Model<
    KnowledgeBaseAttributes,
    KnowledgeBaseCreationAttributes
  >
  implements KnowledgeBaseAttributes
{
  declare id: string;
  declare tenantId: string;
  declare title: string;
  declare content: string;
  declare type: KnowledgeType;
  declare source: string | null;
  declare isActive: boolean;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

KnowledgeBase.init(
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

    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    content: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM(
        "TEXT",
        "FAQ",
        "PRODUCT",
        "DOCUMENT",
        "URL"
      ),
      allowNull: false,
      defaultValue: "TEXT",
    },

    source: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "knowledge_bases",
    modelName: "KnowledgeBase",
    timestamps: true,
  }
);

export default KnowledgeBase;