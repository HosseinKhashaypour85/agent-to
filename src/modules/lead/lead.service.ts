import Lead, {
    LeadSource,
    LeadStatus,
} from "../../models/Lead";
import Customer from "../../models/Customer";
import { Op } from "sequelize";

export async function createLead(data: {
    tenantId: string;
    customerId: string;
    title: string;
    description?: string;
    source?: LeadSource;
    value?: number;
    assignedTo?: string;
    expectedCloseDate?: string;
    notes?: string;
}) {
    const lead = await Lead.create({
        tenantId: data.tenantId,
        customerId: data.customerId,

        title: data.title,

        description: data.description || null,

        status: "NEW",

        source: data.source || "MANUAL",

        value: data.value ?? null,

        assignedTo: data.assignedTo || null,

        expectedCloseDate: data.expectedCloseDate
            ? new Date(data.expectedCloseDate)
            : null,

        notes: data.notes || null,
    });

    return lead;
}

export async function getLeads(
  tenantId: string,
  filters?: {
    status?: LeadStatus;
    source?: LeadSource;
    search?: string;
    page?: number;
    limit?: number;
  }
) {
  const where: any = {
    tenantId,
  };

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.source) {
    where.source = filters.source;
  }

  if (filters?.search) {
    where.title = {
      [Op.like]: `%${filters.search}%`,
    };
  }

  const page = filters?.page || 1;
  const limit = filters?.limit || 20;

  const offset = (page - 1) * limit;

  const { rows, count } =
    await Lead.findAndCountAll({
      where,

      include: [
        {
          model: Customer,
          as: "customer",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "phone",
            "email",
            "telegramId",
            "username",
          ],
        },
      ],

      order: [
        ["createdAt", "DESC"],
      ],

      limit,
      offset,

      distinct: true,
    });

  return {
    leads: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

export async function getLeadById(
    tenantId: string,
    leadId: string
) {
    const lead = await Lead.findOne({
        where: {
            id: leadId,
            tenantId,
        },
    });

    if (!lead) {
        throw new Error("LEAD_NOT_FOUND");
    }

    return lead;
}

export async function updateLeadStatus(
  tenantId: string,
  leadId: string,
  status: LeadStatus
) {
  const lead = await Lead.findOne({
    where: {
      id: leadId,
      tenantId,
    },
  });

  if (!lead) {
    throw new Error("LEAD_NOT_FOUND");
  }

  lead.status = status;

  await lead.save();

  return lead;
}