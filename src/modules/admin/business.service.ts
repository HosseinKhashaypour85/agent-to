import { randomUUID } from "crypto";
import Tenant from "../../models/Tenant";

interface CreateBusinessInput {
  name: string;
  slug: string;
  email: string;
  phone?: string | null;
  status?: "ACTIVE" | "SUSPENDED" | "DEACTIVATED";
}

interface UpdateBusinessInput {
  name?: string;
  slug?: string;
  email?: string;
  phone?: string | null;
  status?: "ACTIVE" | "SUSPENDED" | "DEACTIVATED";
}

function normalizeSlug(slug: string): string {
  return slug
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}

async function ensureUniqueSlug(
  slug: string,
  excludeId?: string
): Promise<void> {
  const where: any = { slug };

  if (excludeId) {
    where.id = { $ne: excludeId };
  }

  const existing = await Tenant.findOne({
    where,
  });

  if (existing) {
    throw new Error("BUSINESS_SLUG_ALREADY_EXISTS");
  }
}

async function ensureUniqueEmail(
  email: string,
  excludeId?: string
): Promise<void> {
  const where: any = { email };

  if (excludeId) {
    where.id = { $ne: excludeId };
  }

  const existing = await Tenant.findOne({
    where,
  });

  if (existing) {
    throw new Error("BUSINESS_EMAIL_ALREADY_EXISTS");
  }
}

export async function createBusiness(input: CreateBusinessInput) {
  const name = input.name?.trim();
  const slug = normalizeSlug(input.slug || "");
  const email = input.email?.trim().toLowerCase();
  const phone = input.phone?.trim() || null;

  if (!name) {
    throw new Error("BUSINESS_NAME_REQUIRED");
  }

  if (!slug) {
    throw new Error("BUSINESS_SLUG_REQUIRED");
  }

  if (!email) {
    throw new Error("BUSINESS_EMAIL_REQUIRED");
  }

  await ensureUniqueSlug(slug);
  await ensureUniqueEmail(email);

  const business = await Tenant.create({
    id: randomUUID(),
    name,
    slug,
    email,
    phone,
    status: input.status || "ACTIVE",
  });

  return business;
}

export async function getBusinesses() {
  return Tenant.findAll({
    order: [["createdAt", "DESC"]],
  });
}

export async function getBusinessById(id: string) {
  if (!id) {
    throw new Error("BUSINESS_ID_REQUIRED");
  }

  const business = await Tenant.findByPk(id);

  if (!business) {
    throw new Error("BUSINESS_NOT_FOUND");
  }

  return business;
}

export async function updateBusiness(
  id: string,
  input: UpdateBusinessInput
) {
  const business = await getBusinessById(id);

  if (input.name !== undefined) {
    const name = input.name.trim();

    if (!name) {
      throw new Error("BUSINESS_NAME_REQUIRED");
    }

    business.name = name;
  }

  if (input.slug !== undefined) {
    const slug = normalizeSlug(input.slug);

    if (!slug) {
      throw new Error("BUSINESS_SLUG_REQUIRED");
    }

    await ensureUniqueSlug(slug, id);
    business.slug = slug;
  }

  if (input.email !== undefined) {
    const email = input.email.trim().toLowerCase();

    if (!email) {
      throw new Error("BUSINESS_EMAIL_REQUIRED");
    }

    await ensureUniqueEmail(email, id);
    business.email = email;
  }

  if (input.phone !== undefined) {
    business.phone = input.phone?.trim() || null;
  }

  if (input.status !== undefined) {
    business.status = input.status;
  }

  await business.save();

  return business;
}

export async function updateBusinessStatus(
  id: string,
  status: "ACTIVE" | "SUSPENDED" | "DEACTIVATED"
) {
  const business = await getBusinessById(id);

  business.status = status;

  await business.save();

  return business;
}

export async function deleteBusiness(id: string) {
  const business = await getBusinessById(id);

  await business.destroy();

  return {
    success: true,
    message: "Business deleted successfully",
  };
}