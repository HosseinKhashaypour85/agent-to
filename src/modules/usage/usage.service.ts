import { Op, fn, col } from "sequelize";
import UsageRecord, {
  UsageSource,
} from "../../models/UsageRecord";

interface RecordAIUsageInput {
  tenantId: string;
  conversationId: string;
  source: UsageSource;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  usageAvailable?: boolean;
}

interface UsageDateFilters {
  from?: unknown;
  to?: unknown;
}

function safeNumber(value: unknown): number {
  const numberValue = Number(value ?? 0);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function getDateRange(filters: UsageDateFilters) {
  const now = new Date();

  const from = filters.from
    ? new Date(String(filters.from))
    : new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);

  const to = filters.to
    ? new Date(String(filters.to))
    : now;

  if (
    Number.isNaN(from.getTime()) ||
    Number.isNaN(to.getTime())
  ) {
    throw new Error("INVALID_USAGE_DATE_RANGE");
  }

  if (filters.from) {
    from.setHours(0, 0, 0, 0);
  }

  if (filters.to) {
    to.setHours(23, 59, 59, 999);
  }

  if (to.getTime() < from.getTime()) {
    throw new Error("INVALID_USAGE_DATE_RANGE");
  }

  return { from, to };
}

function buildWhere(
  tenantId: string | undefined,
  range: { from: Date; to: Date }
) {
  const where: Record<string | symbol, any> = {
    createdAt: {
      [Op.between]: [range.from, range.to],
    },
  };

  if (tenantId) {
    where.tenantId = tenantId;
  }

  return where;
}

async function getSummary(where: Record<string | symbol, any>) {
  const row = (await UsageRecord.findOne({
    attributes: [
      [
        fn("COALESCE", fn("SUM", col("aiMessages")), 0),
        "aiMessages",
      ],
      [
        fn("COALESCE", fn("SUM", col("inputTokens")), 0),
        "inputTokens",
      ],
      [
        fn("COALESCE", fn("SUM", col("outputTokens")), 0),
        "outputTokens",
      ],
      [
        fn("COALESCE", fn("SUM", col("totalTokens")), 0),
        "totalTokens",
      ],
      [
        fn("COALESCE", fn("SUM", col("usageAvailable")), 0),
        "recordsWithTokenUsage",
      ],
      [fn("COUNT", col("id")), "requests"],
    ],
    where,
    raw: true,
  })) as any;

  return {
    aiMessages: safeNumber(row?.aiMessages),
    inputTokens: safeNumber(row?.inputTokens),
    outputTokens: safeNumber(row?.outputTokens),
    totalTokens: safeNumber(row?.totalTokens),
    recordsWithTokenUsage: safeNumber(
      row?.recordsWithTokenUsage
    ),
    requests: safeNumber(row?.requests),
  };
}

async function getDailyUsage(
  where: Record<string | symbol, any>
) {
  const dateExpression = fn("DATE", col("createdAt"));

  const rows = (await UsageRecord.findAll({
    attributes: [
      [dateExpression, "date"],
      [
        fn("SUM", col("aiMessages")),
        "aiMessages",
      ],
      [
        fn("SUM", col("inputTokens")),
        "inputTokens",
      ],
      [
        fn("SUM", col("outputTokens")),
        "outputTokens",
      ],
      [
        fn("SUM", col("totalTokens")),
        "totalTokens",
      ],
    ],
    where,
    group: [dateExpression],
    order: [[dateExpression, "ASC"]],
    raw: true,
  })) as any[];

  return rows.map((row) => ({
    date: row.date,
    aiMessages: safeNumber(row.aiMessages),
    inputTokens: safeNumber(row.inputTokens),
    outputTokens: safeNumber(row.outputTokens),
    totalTokens: safeNumber(row.totalTokens),
  }));
}

async function getRecentUsage(
  where: Record<string | symbol, any>
) {
  return UsageRecord.findAll({
    attributes: [
      "id",
      "tenantId",
      "conversationId",
      "source",
      "model",
      "inputTokens",
      "outputTokens",
      "totalTokens",
      "aiMessages",
      "usageAvailable",
      "createdAt",
    ],
    where,
    order: [["createdAt", "DESC"]],
    limit: 50,
  });
}

/**
 * ثبت آمار یک پاسخ هوش مصنوعی.
 * خطای ثبت Usage نباید پاسخ چت را خراب کند.
 */
export async function recordAIUsage(
  data: RecordAIUsageInput
) {
  try {
    const inputTokens = Math.max(
      0,
      Math.floor(safeNumber(data.inputTokens))
    );

    const outputTokens = Math.max(
      0,
      Math.floor(safeNumber(data.outputTokens))
    );

    const totalTokens = Math.max(
      0,
      Math.floor(
        data.totalTokens !== undefined
          ? safeNumber(data.totalTokens)
          : inputTokens + outputTokens
      )
    );

    await UsageRecord.create({
      tenantId: data.tenantId,
      conversationId: data.conversationId,
      source: data.source,
      model: data.model,
      inputTokens,
      outputTokens,
      totalTokens,
      aiMessages: 1,
      usageAvailable: data.usageAvailable ?? false,
    });
  } catch (error) {
    console.error("RECORD AI USAGE ERROR:", error);
  }
}

/**
 * گزارش مصرف Tenant در بازه انتخاب‌شده.
 * در صورت ندادن تاریخ، ۳۰ روز اخیر گزارش می‌شود.
 */
export async function getTenantUsageReport(
  tenantId: string,
  filters: UsageDateFilters
) {
  const range = getDateRange(filters);
  const where = buildWhere(tenantId, range);

  const [summary, daily, recent] = await Promise.all([
    getSummary(where),
    getDailyUsage(where),
    getRecentUsage(where),
  ]);

  return {
    period: {
      from: range.from,
      to: range.to,
    },
    summary,
    daily,
    recent,
  };
}

/**
 * گزارش مصرف تمام Tenantها برای Super Admin.
 */
export async function getAdminUsageReport(
  filters: UsageDateFilters
) {
  const range = getDateRange(filters);
  const where = buildWhere(undefined, range);

  const tenantRows = (await UsageRecord.findAll({
    attributes: [
      "tenantId",
      [
        fn("SUM", col("aiMessages")),
        "aiMessages",
      ],
      [
        fn("SUM", col("inputTokens")),
        "inputTokens",
      ],
      [
        fn("SUM", col("outputTokens")),
        "outputTokens",
      ],
      [
        fn("SUM", col("totalTokens")),
        "totalTokens",
      ],
      [fn("COUNT", col("id")), "requests"],
    ],
    where,
    group: ["tenantId"],
    order: [[fn("SUM", col("totalTokens")), "DESC"]],
    raw: true,
  })) as any[];

  const [summary, daily, recent] = await Promise.all([
    getSummary(where),
    getDailyUsage(where),
    getRecentUsage(where),
  ]);

  const tenants = tenantRows.map((row) => ({
    tenantId: row.tenantId,
    aiMessages: safeNumber(row.aiMessages),
    inputTokens: safeNumber(row.inputTokens),
    outputTokens: safeNumber(row.outputTokens),
    totalTokens: safeNumber(row.totalTokens),
    requests: safeNumber(row.requests),
  }));

  return {
    period: {
      from: range.from,
      to: range.to,
    },
    summary,
    tenants,
    daily,
    recent,
  };
}