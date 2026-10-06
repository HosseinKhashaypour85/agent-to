import "dotenv/config";
import { sequelize } from "./src/config/database";
import LeadScore from "./src/models/LeadScore";
import Customer from "./src/models/Customer";

async function test() {
  try {
    await sequelize.authenticate();
    console.log("Connected to DB");

    const tenantId = "eeda41ca-b9ee-44b7-8597-a9e49b7ac397";
    
    // Test basic query
    const scores = await LeadScore.findAll({
      where: { tenantId, temperature: "HOT" },
      order: [["score", "DESC"]],
      include: [
        {
          model: Customer,
          as: "customer",
          attributes: ["id", "firstName", "lastName", "phone", "email"],
        },
      ],
    });
    
    console.log("Result:", JSON.stringify(scores, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

test();