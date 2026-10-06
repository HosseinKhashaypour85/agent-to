import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

interface UserAttributes {
  id: string;
  tenantId: string;
  email: string;
  password: string;
  firstName: string | null;
  lastName: string | null;
  role: "SUPER_ADMIN" | "ADMIN" | "STAFF";
  isEmailVerified: boolean;
  lastLogin: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes
  extends Optional<UserAttributes, "id" | "tenantId" | "role" | "isEmailVerified" | "lastLogin" | "firstName" | "lastName" | "createdAt" | "updatedAt"> { }

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  declare id: string;
  declare tenantId: string;
  declare email: string;
  declare password: string;
  declare firstName: string | null;
  declare lastName: string | null;
  declare role: "SUPER_ADMIN" | "ADMIN" | "STAFF";
  declare isEmailVerified: boolean;
  declare lastLogin: Date | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

User.init(
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

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    firstName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    lastName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    role: {
      type: DataTypes.ENUM("SUPER_ADMIN", "ADMIN", "STAFF"),
      allowNull: false,
      defaultValue: "STAFF",
    },

    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "users",
    modelName: "User",
    timestamps: true,
  }
);

export default User;
