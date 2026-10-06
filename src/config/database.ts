import { Sequelize } from "sequelize";

const isProduction =
  process.env.NODE_ENV === "production";

export const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  {
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT!),
    dialect: "mysql",
    logging: isProduction
      ? false
      : console.log,
    pool: {
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 10000,
      evict: 1000,
    },
    dialectOptions: {
      connectTimeout: 60000,
    },
  }
);