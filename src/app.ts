import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./modules/auth/auth.routes";
import siteRoutes from "./modules/site/site.routes";
import customerRoutes from "./modules/customer/customer.routes";
import leadRoutes from "./modules/lead/lead.routes";
import conversationRoutes from "./modules/conversation/conversation.routes";
import messageRoutes from "./modules/message/message.routes";
import aiRoutes from "./modules/ai/ai.routes";
import knowledgeRoutes from "./modules/knowledge/knowledge.routes";
import productRoutes from "./modules/product/product.routes";
import chatRoutes from "./modules/chat/chat.routes";
import siteChatSettingsRoutes from "./modules/site/site-chat-settings.routes";
import agentRoutes from "./modules/agent/agent.routes";
import agentProductsRoutes from "./modules/agent/agent-products.routes";
import agentChannelRoutes from "./modules/agent/agent-channel.routes";
import agentKnowledgeRoutes from "./modules/agent/agent-knowledge.routes";
import leadPipelineRoutes from "./modules/lead/lead-pipeline.routes";
import siteInstallerRoutes from "./modules/site/site-installer.routes";
import siteInstallTokenRoutes from "./modules/site/site-install-token.routes";
import installerRoutes from "./modules/installer/installer.routes";
import telegramRoutes from "./modules/telegram/telegram.routes";
import adminPlanRoutes from "./modules/admin/plan.routes";
import adminSubscriptionRoutes from "./modules/admin/subscription.routes";
import adminBusinessRoutes from "./modules/admin/business.routes";
import adminBusinessOverviewRoutes from "./modules/admin/business-overview.routes";
import adminBusinessOwnerRoutes from "./modules/admin/business-owner.routes";
import dashboardStatsRoutes from "./modules/admin/dashboard-stats.routes";
import crmRoutes from "./modules/crm/crm.routes";
import adminAuthRoutes from "./modules/admin/auth/admin-auth.routes";
import cookieParser from "cookie-parser";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use(
  (err: any, _req: any, res: any, _next: any) => {
    const isParseError =
      err?.type === "entity.parse.failed" ||
      (err?.name === "SyntaxError" &&
        err?.status === 400 &&
        err?.body !== undefined);

    if (isParseError) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON in request body",
      });
    }

    if (err) {
      console.error("APP ERROR:", err);
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  });

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "My AI Agent API is running 🚀",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/v1/test-crm", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "CRM test route works",
  });
});


app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/sites", siteRoutes);
app.use(
  "/api/v1/customers",
  customerRoutes
);
app.use(
  "/api/v1/leads",
  leadRoutes
);
app.use(
  "/api/v1/conversations",
  conversationRoutes
);
app.use(
  "/api/v1/messages",
  messageRoutes
);
app.use(
  "/api/v1/ai",
  aiRoutes
);
app.use(
  "/api/v1/knowledge",
  knowledgeRoutes
);
app.use(
  "/api/v1/chat",
  chatRoutes
);
app.use("/api/v1/products", productRoutes);

app.use("/api/v1/agent/products", agentProductsRoutes);
app.use("/api/v1/agent/channels", agentChannelRoutes);
app.use("/api/v1/agent/knowledge", agentKnowledgeRoutes);
app.use("/api/v1/agent", agentRoutes);
app.use("/api/v1/leads", leadPipelineRoutes);
app.use(
  "/api/v1/sites",
  siteInstallerRoutes
);
app.use(
  "/api/v1/sites",
  siteInstallTokenRoutes
);
app.use("/api/v1/telegram", telegramRoutes);
app.use("/", installerRoutes);
app.use(
  "/api/v1/admin/plans",
  adminPlanRoutes
);
app.use(
  "/api/v1/admin/subscriptions",
  adminSubscriptionRoutes
);
app.use(
  "/api/v1/admin/businesses",
  adminBusinessRoutes
);
app.use(
  "/api/v1/admin/businesses",
  adminBusinessOverviewRoutes
);
app.use(
  "/api/v1/admin/businesses",
  adminBusinessOwnerRoutes
);
app.use(
  "/api/v1/admin/dashboard",
  dashboardStatsRoutes
);
app.use("/api/v1/crm", crmRoutes);
app.use("/api/v1", siteChatSettingsRoutes);
app.use("/api/v1/admin/auth", adminAuthRoutes);
export default app;