import Lead, {
  LeadStatus,
} from "../../models/Lead";


// ============================================================
// Status Order
// ============================================================

const STATUS_PRIORITY: Record<
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


// ============================================================
// Valid Transitions
// ============================================================

const VALID_TRANSITIONS: Record<
  LeadStatus,
  LeadStatus[]
> = {
  NEW: [
    "CONTACTED",
    "QUALIFIED",
    "LOST",
  ],

  CONTACTED: [
    "QUALIFIED",
    "PROPOSAL",
    "LOST",
  ],

  QUALIFIED: [
    "PROPOSAL",
    "WON",
    "LOST",
  ],

  PROPOSAL: [
    "WON",
    "LOST",
  ],

  WON: [],

  LOST: [
    "NEW",
  ],
};


// ============================================================
// Get Lead
// ============================================================

async function getTenantLead(
  tenantId: string,
  leadId: string
) {

  const lead =
    await Lead.findOne({
      where: {
        id: leadId,
        tenantId,
      },
    });


  if (!lead) {
    throw new Error(
      "LEAD_NOT_FOUND"
    );
  }


  return lead;
}


// ============================================================
// Check Transition
// ============================================================

export function canMoveLead(
  currentStatus: LeadStatus,
  nextStatus: LeadStatus
): boolean {

  if (
    currentStatus ===
    nextStatus
  ) {
    return true;
  }


  return VALID_TRANSITIONS[
    currentStatus
  ].includes(
    nextStatus
  );
}


// ============================================================
// Move Lead
// ============================================================

export async function moveLead(
  tenantId: string,
  leadId: string,
  nextStatus: LeadStatus
) {

  const lead =
    await getTenantLead(
      tenantId,
      leadId
    );


  const currentStatus =
    lead.status;


  // ----------------------------------------------------------
  // Same Status
  // ----------------------------------------------------------

  if (
    currentStatus ===
    nextStatus
  ) {
    return lead;
  }


  // ----------------------------------------------------------
  // Validate Transition
  // ----------------------------------------------------------

  if (
    !canMoveLead(
      currentStatus,
      nextStatus
    )
  ) {

    throw new Error(
      `INVALID_LEAD_TRANSITION:${currentStatus}->${nextStatus}`
    );
  }


  // ----------------------------------------------------------
  // Update
  // ----------------------------------------------------------

  lead.status =
    nextStatus;


  await lead.save();


  return lead;
}


// ============================================================
// Get Pipeline
// ============================================================

export async function getLeadPipeline(
  tenantId: string
) {

  const leads =
    await Lead.findAll({
      where: {
        tenantId,
      },

      order: [
        ["createdAt", "DESC"],
      ],
    });


  const pipeline: Record<
    LeadStatus,
    Lead[]
  > = {
    NEW: [],
    CONTACTED: [],
    QUALIFIED: [],
    PROPOSAL: [],
    WON: [],
    LOST: [],
  };


  for (const lead of leads) {

    pipeline[
      lead.status
    ].push(lead);
  }


  return {
    pipeline,

    summary: {
      NEW:
        pipeline.NEW.length,

      CONTACTED:
        pipeline.CONTACTED.length,

      QUALIFIED:
        pipeline.QUALIFIED.length,

      PROPOSAL:
        pipeline.PROPOSAL.length,

      WON:
        pipeline.WON.length,

      LOST:
        pipeline.LOST.length,

      total:
        leads.length,
    },
  };
}


// ============================================================
// Get Pipeline Statistics
// ============================================================

export async function getLeadPipelineStats(
  tenantId: string
) {

  const leads =
    await Lead.findAll({
      where: {
        tenantId,
      },

      attributes: [
        "status",
        "value",
      ],
    });


  let totalValue = 0;

  let wonValue = 0;

  let openValue = 0;


  for (const lead of leads) {

    const value =
      lead.value
        ? Number(
            lead.value
          )
        : 0;


    totalValue +=
      value;


    if (
      lead.status ===
      "WON"
    ) {

      wonValue +=
        value;

    } else if (
      lead.status !==
      "LOST"
    ) {

      openValue +=
        value;
    }
  }


  return {
    totalLeads:
      leads.length,

    totalValue,

    wonValue,

    openValue,

    conversionBase:
      leads.filter(
        (lead) =>
          lead.status !==
          "LOST"
      ).length,
  };
}