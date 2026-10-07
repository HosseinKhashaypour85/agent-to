import "dotenv/config";
import { sequelize } from "./src/config/database";
import User from "./src/models/User";
import Tenant from "./src/models/Tenant";
import Site from "./src/models/Site";

async function main() {
  try {
    await sequelize.authenticate();
    console.log("DB connected");

    const users = await User.findAll({
      attributes: ["id", "email", "role", "tenantId"],
    });
    console.log(
      "USERS:",
      JSON.stringify(
        users.map((u) => ({
          email: u.email,
          role: u.role,
          tenantId: u.tenantId,
        })),
        null,
        2
      )
    );

    const tenants = await Tenant.findAll({
      attributes: ["id", "name", "slug", "status"],
    });
    console.log(
      "TENANTS:",
      JSON.stringify(
        tenants.map((t) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          status: t.status,
        })),
        null,
        2
      )
    );

    const sites = await Site.findAll({
      attributes: ["id", "siteId", "domain", "name", "status", "tenantId"],
    });
    console.log(
      "SITES:",
      JSON.stringify(
        sites.map((s) => ({
          siteId: s.siteId,
          name: s.name,
          status: s.status,
          tenantId: s.tenantId,
        })),
        null,
        2
      )
    );
  } catch (err: any) {
    console.error("ERROR:", err?.message || err);
  } finally {
    await sequelize.close();
  }
}

main();
