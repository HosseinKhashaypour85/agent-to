import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";

import { sequelize } from "../config/database";

class SiteChatSettings extends Model<
  InferAttributes<SiteChatSettings>,
  InferCreationAttributes<SiteChatSettings>
> {
  declare id: string;

  /**
   * UUID داخلی Site
   */
  declare siteId: string;

  // ==========================================
  // Theme
  // ==========================================

  declare primaryColor: string;
  declare secondaryColor: string;
  declare accentColor: string;

  declare backgroundColor: string;
  declare surfaceColor: string;

  declare userMessageColor: string;
  declare aiMessageColor: string;

  declare textColor: string;
  declare borderColor: string;

  declare buttonTextColor: string;

  // ==========================================
  // Branding
  // ==========================================

  declare logoUrl: string | null;

  // ==========================================
  // Welcome
  // ==========================================

  declare welcomeTitle: string;
  declare welcomeMessage: string;

  // ==========================================
  // Status
  // ==========================================

  declare onlineLabel: string;
  declare responseTimeText: string;

  // ==========================================
  // Business information
  // ==========================================

  declare phone: string | null;
  declare address: string | null;

  // ==========================================
  // Composer
  // ==========================================

  declare inputPlaceholder: string;

  // ==========================================
  // Footer
  // ==========================================

  declare footerText: string | null;

  // ==========================================
  // Visibility
  // ==========================================

  declare showPhone: boolean;
  declare showAddress: boolean;
  declare showFooter: boolean;

  // ==========================================
  // Quick Actions
  // ==========================================

  declare quickActions: string[];

  // ==========================================
  // Timestamps
  // ==========================================

  declare createdAt?: Date;
  declare updatedAt?: Date;
}

SiteChatSettings.init(
  {
    // ==========================================
    // ID
    // ==========================================

    id: {
      type: DataTypes.STRING(191),
      primaryKey: true,
      allowNull: false,
    },

    // ==========================================
    // Site
    // ==========================================

    siteId: {
      type: DataTypes.STRING(191),
      allowNull: false,
      unique: true,
    },

    // ==========================================
    // Theme
    // ==========================================

    primaryColor: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "#10706B",
    },

    secondaryColor: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "#0D5C58",
    },

    accentColor: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "#F59E0B",
    },

    backgroundColor: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "#F8F9FC",
    },

    surfaceColor: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "#FFFFFF",
    },

    userMessageColor: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "#F1F3F5",
    },

    aiMessageColor: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "#10706B",
    },

    textColor: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "#171717",
    },

    borderColor: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "#E5E7EB",
    },

    buttonTextColor: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "#FFFFFF",
    },

    // ==========================================
    // Branding
    // ==========================================

    logoUrl: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },

    // ==========================================
    // Welcome
    // ==========================================

    welcomeTitle: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "سلام 👋",
    },

    welcomeMessage: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "چطور می‌توانیم کمکتان کنیم؟",
    },

    // ==========================================
    // Status
    // ==========================================

    onlineLabel: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "آنلاین",
    },

    responseTimeText: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "معمولاً کمتر از ۲ دقیقه",
    },

    // ==========================================
    // Business information
    // ==========================================

    phone: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    address: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    // ==========================================
    // Composer
    // ==========================================

    inputPlaceholder: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "پیام خود را بنویسید...",
    },

    // ==========================================
    // Footer
    // ==========================================

    footerText: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    // ==========================================
    // Visibility
    // ==========================================

    showPhone: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    showAddress: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    showFooter: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    // ==========================================
    // Quick Actions
    // ==========================================

    quickActions: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },

    // ==========================================
    // Timestamps
    // ==========================================

    createdAt: {
      type: DataTypes.DATE(3),
      allowNull: false,
    },

    updatedAt: {
      type: DataTypes.DATE(3),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "site_chat_settings",
    timestamps: true,
  }
);

export default SiteChatSettings;