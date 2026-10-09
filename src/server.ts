import "dotenv/config";

import User from "./models/User";
import Tenant from "./models/Tenant";
import Site from "./models/Site";
import Installation from "./models/Installation";
import Customer from "./models/Customer";
import Lead from "./models/Lead";
import Conversation from "./models/Conversation";
import BusinessOwner from "./models/BusinessOwner";
import app from "./app";
import { sequelize } from "./config/database";
import Message from "./models/Message";
const PORT = Number(process.env.PORT) || 3000;
import KnowledgeBase from "./models/KnowledgeBase";
import Product from "./models/Product";
import SiteChatSettings from "./models/SiteChatSettings";
import Agent from "./models/Agent";
import AgentChannel from "./models/AgentChannel"
import SubscriptionPlan from "./models/SubscriptionPlan";
import Subscription from "./models/Subscription";
import LeadScore from "./models/LeadScore";
import CustomerMemory from "./models/CustomerMemory";
import UsageRecord from "./models/UsageRecord";

Lead.belongsTo(Customer, {
  foreignKey: "customerId",
  as: "customer",
});

// Customer -> Leads
Customer.hasMany(Lead, {
  foreignKey: "customerId",
  as: "leads",
});


Subscription.belongsTo(Tenant, {
  foreignKey: "tenantId",
  targetKey: "id",
  as: "tenant",
});

Tenant.hasMany(Subscription, {
  foreignKey: "tenantId",
  sourceKey: "id",
  as: "subscriptions",
});

Subscription.belongsTo(SubscriptionPlan, {
  foreignKey: "planId",
  targetKey: "id",
  as: "plan",
});

SubscriptionPlan.hasMany(Subscription, {
  foreignKey: "planId",
  sourceKey: "id",
  as: "subscriptions",
});


LeadScore.belongsTo(Customer, {
  foreignKey: "customerId",
  as: "customer",
});

LeadScore.belongsTo(Lead, {
  foreignKey: "leadId",
  as: "lead",
});

Customer.hasMany(LeadScore, {
  foreignKey: "customerId",
  as: "leadScores",
});

CustomerMemory.belongsTo(Customer, {
  foreignKey: "customerId",
  as: "customer",
});

Customer.hasMany(CustomerMemory, {
  foreignKey: "customerId",
  as: "memories",
});


async function bootstrap() {
  try {
    await sequelize.authenticate();

    console.log("✅ MySQL connected successfully");

    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync();
      console.log("✅ Database synchronized");
    } else {
      console.log("✅ Production mode — skipping sync");
    }

    app.listen(PORT, () => {
      console.log(
        `🚀 Server running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error(error);

    process.exit(1);
  }
}

bootstrap();