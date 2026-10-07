import "dotenv/config";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { sequelize } from "./src/config/database";
import User from "./src/models/User";
import Tenant from "./src/models/Tenant";

async function main() {
  try {
    await sequelize.authenticate();

    const tenant = await Tenant.findOne();
    if (!tenant) {
      console.error("No tenant found");
      return;
    }

    const existing = await User.findOne({
      where: { email: "superadmin@test.com" },
    });

    if (existing) {
      await existing.update({
        password: await bcrypt.hash("test123", 12),
        role: "SUPER_ADMIN",
        tenantId: tenant.id,
      });
      console.log("UPDATED existing superadmin@test.com");
    } else {
      await User.create({
        id: randomUUID(),
        tenantId: tenant.id,
        email: "superadmin@test.com",
        password: await bcrypt.hash("test123", 12),
        firstName: "Super",
        lastName: "Admin",
        role: "SUPER_ADMIN",
        isEmailVerified: true,
        lastLogin: null,
      });
      console.log("CREATED superadmin@test.com / test123");
    }
  } catch (err: any) {
    console.error("ERROR:", err?.message || err);
  } finally {
    await sequelize.close();
  }
}

main();
