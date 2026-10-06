import { randomUUID } from "crypto";

import Customer from "../../models/Customer";
import Lead, {
  LeadSource,
  LeadStatus,
} from "../../models/Lead";


// ============================================================
// Types
// ============================================================

export interface CRMIntelligenceInput {
  tenantId: string;

  customerId: string;

  intent: string;

  productName?: string | null;

  userMessage: string;

  source?: LeadSource;
}


// ============================================================
// Product Intent Detection
// ============================================================

function isLeadIntent(intent: string): boolean {
  return [
    "order",
    "price",
    "product_details",
    "product_search",
  ].includes(intent);
}


// ============================================================
// Lead Status Detection
// ============================================================

function detectLeadStatus(
  intent: string,
  message: string
): LeadStatus {

  const text =
    message
      .trim()
      .toLowerCase();


  // ----------------------------------------------------------
  // Strong buying signals
  // ----------------------------------------------------------

  const buyingSignals = [
    "میخوام",
    "می‌خوام",
    "میخواهم",
    "می‌خواهم",
    "سفارش",
    "خرید",
    "بخرم",
    "ثبت سفارش",
    "پرداخت",
    "خریداری",
  ];


  const hasBuyingSignal =
    buyingSignals.some(
      (word) =>
        text.includes(word)
    );


  if (
    intent === "order" ||
    hasBuyingSignal
  ) {
    return "QUALIFIED";
  }


  // ----------------------------------------------------------
  // Price / product research
  // ----------------------------------------------------------

  if (
    intent === "price" ||
    intent === "product_search" ||
    intent === "product_details"
  ) {
    return "NEW";
  }


  return "NEW";
}


// ============================================================
// Lead Title
// ============================================================

function buildLeadTitle(
  intent: string,
  productName?: string | null
): string {

  if (productName?.trim()) {

    if (intent === "order") {
      return `خرید ${productName.trim()}`;
    }

    if (intent === "price") {
      return `استعلام قیمت ${productName.trim()}`;
    }

    if (intent === "product_details") {
      return `بررسی ${productName.trim()}`;
    }

    if (intent === "product_search") {
      return `جستجوی ${productName.trim()}`;
    }
  }


  return "مشتری از طریق AI";
}


// ============================================================
// Find Existing Lead
// ============================================================

async function findExistingLead(
  tenantId: string,
  customerId: string,
  productName?: string | null
) {

  const leads =
    await Lead.findAll({
      where: {
        tenantId,
        customerId,
      },

      order: [
        ["createdAt", "DESC"],
      ],

      limit: 20,
    });


  if (
    !productName?.trim()
  ) {
    return leads[0] || null;
  }


  const normalizedProduct =
    productName
      .trim()
      .toLowerCase();


  const existing =
    leads.find(
      (lead) =>
        lead.title
          ?.toLowerCase()
          .includes(
            normalizedProduct
          )
    );


  return existing || null;
}


// ============================================================
// Update Existing Lead
// ============================================================

async function updateExistingLead(
  lead: Lead,
  data: CRMIntelligenceInput
) {

  const newStatus =
    detectLeadStatus(
      data.intent,
      data.userMessage
    );


  const currentStatus =
    lead.status;


  // ----------------------------------------------------------
  // Never downgrade important lead status
  // ----------------------------------------------------------

  const statusPriority: Record<
    LeadStatus,
    number
  > = {
    NEW: 1,
    CONTACTED: 2,
    QUALIFIED: 3,
    PROPOSAL: 4,
    WON: 5,
    LOST: 0,
  };


  if (
    statusPriority[newStatus] >
    statusPriority[currentStatus]
  ) {
    lead.status = newStatus;
  }


  // ----------------------------------------------------------
  // Update description
  // ----------------------------------------------------------

  const oldDescription =
    lead.description || "";


  if (
    !oldDescription.includes(
      data.userMessage
    )
  ) {

    lead.description =
      oldDescription
        ? `${oldDescription}\n${data.userMessage}`
        : data.userMessage;
  }


  // ----------------------------------------------------------
  // Update source
  // ----------------------------------------------------------

  lead.source =
    data.source || "AI";


  await lead.save();


  return lead;
}


// ============================================================
// Create New Lead
// ============================================================

async function createIntelligenceLead(
  data: CRMIntelligenceInput
) {

  const status =
    detectLeadStatus(
      data.intent,
      data.userMessage
    );


  const title =
    buildLeadTitle(
      data.intent,
      data.productName
    );


  const lead =
    await Lead.create({
      id: randomUUID(),

      tenantId:
        data.tenantId,

      customerId:
        data.customerId,

      title,

      description:
        data.userMessage,

      status,

      source:
        data.source || "AI",

      value:
        null,

      assignedTo:
        null,

      expectedCloseDate:
        null,

      notes:
        `ایجاد خودکار توسط AI Agent\nIntent: ${data.intent}`,
    });


  return lead;
}


// ============================================================
// Main CRM Intelligence
// ============================================================

export async function processCRMIntelligence(
  data: CRMIntelligenceInput
) {

  // ==========================================================
  // Validate
  // ==========================================================

  if (!data.tenantId?.trim()) {
    throw new Error(
      "TENANT_ID_REQUIRED"
    );
  }

  if (!data.customerId?.trim()) {
    throw new Error(
      "CUSTOMER_ID_REQUIRED"
    );
  }

  if (!data.userMessage?.trim()) {
    throw new Error(
      "MESSAGE_REQUIRED"
    );
  }


  // ==========================================================
  // Check Customer
  // ==========================================================

  const customer =
    await Customer.findOne({
      where: {
        id: data.customerId,
        tenantId: data.tenantId,
      },
    });


  if (!customer) {
    throw new Error(
      "CUSTOMER_NOT_FOUND"
    );
  }


  // ==========================================================
  // Check Intent
  // ==========================================================

  if (
    !isLeadIntent(
      data.intent
    )
  ) {

    return {
      created: false,

      updated: false,

      lead: null,

      reason:
        "INTENT_NOT_LEAD_RELATED",
    };
  }


  // ==========================================================
  // Find Existing Lead
  // ==========================================================

  const existingLead =
    await findExistingLead(
      data.tenantId,
      data.customerId,
      data.productName
    );


  // ==========================================================
  // Update Existing Lead
  // ==========================================================

  if (existingLead) {

    const updatedLead =
      await updateExistingLead(
        existingLead,
        data
      );


    return {
      created: false,

      updated: true,

      lead: updatedLead,

      reason:
        "EXISTING_LEAD_UPDATED",
    };
  }


  // ==========================================================
  // Create New Lead
  // ==========================================================

  const lead =
    await createIntelligenceLead(
      data
    );


  return {
    created: true,

    updated: false,

    lead,

    reason:
      "NEW_LEAD_CREATED",
  };
}