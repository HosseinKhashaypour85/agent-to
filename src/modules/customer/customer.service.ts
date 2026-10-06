import Customer from "../../models/Customer";

export async function createCustomer(data: {
  tenantId: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  telegramId?: string;
  username?: string;
  referredBy?: string;
}) {
  const customer = await Customer.create({
    tenantId: data.tenantId,

    firstName: data.firstName || null,
    lastName: data.lastName || null,

    phone: data.phone || null,
    email: data.email || null,

    telegramId: data.telegramId || "",
    username: data.username || null,
    referredBy: data.referredBy || null,
  });

  return customer;
}

export async function getCustomers(
  tenantId: string
) {
  return Customer.findAll({
    where: {
      tenantId,
    },

    order: [
      ["createdAt", "DESC"],
    ],
  });
}

export async function getCustomerById(
  tenantId: string,
  customerId: string
) {
  const customer = await Customer.findOne({
    where: {
      id: customerId,
      tenantId,
    },
  });

  if (!customer) {
    throw new Error("CUSTOMER_NOT_FOUND");
  }

  return customer;
}
