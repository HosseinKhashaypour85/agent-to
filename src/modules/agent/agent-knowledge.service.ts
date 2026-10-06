import { randomUUID } from "crypto";
import { Op } from "sequelize";

import KnowledgeBase, {
  KnowledgeType,
} from "../../models/KnowledgeBase";

function isValidKnowledgeType(
  value: unknown
): value is KnowledgeType {
  return (
    value === "TEXT" ||
    value === "FAQ" ||
    value === "PRODUCT" ||
    value === "DOCUMENT" ||
    value === "URL"
  );
}

export async function getKnowledgeList(
  tenantId: string,
  options?: {
    search?: string;
    type?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }
) {
  if (!tenantId?.trim()) {
    throw new Error("TENANT_ID_REQUIRED");
  }

  const page = Math.max(
    Number(options?.page) || 1,
    1
  );

  const limit = Math.min(
    Math.max(
      Number(options?.limit) || 20,
      1
    ),
    100
  );

  const offset = (page - 1) * limit;

  const where: any = {
    tenantId,
  };

  // Search
  if (options?.search?.trim()) {
    const search = options.search.trim();

    where[Op.or] = [
      {
        title: {
          [Op.like]: `%${search}%`,
        },
      },
      {
        content: {
          [Op.like]: `%${search}%`,
        },
      },
    ];
  }

  // Type
  if (
    options?.type &&
    isValidKnowledgeType(options.type)
  ) {
    where.type = options.type;
  }

  // Active
  if (
    options?.isActive !== undefined
  ) {
    where.isActive =
      options.isActive;
  }

  const {
    rows,
    count,
  } =
    await KnowledgeBase.findAndCountAll({
      where,

      order: [
        ["createdAt", "DESC"],
      ],

      limit,
      offset,
    });

  return {
    knowledge: rows,

    pagination: {
      page,
      limit,
      total: count,
      totalPages:
        Math.ceil(count / limit),
    },
  };
}

export async function getKnowledge(
  tenantId: string,
  id: string
) {
  if (!tenantId?.trim()) {
    throw new Error(
      "TENANT_ID_REQUIRED"
    );
  }

  if (!id?.trim()) {
    throw new Error(
      "KNOWLEDGE_ID_REQUIRED"
    );
  }

  const knowledge =
    await KnowledgeBase.findOne({
      where: {
        id,
        tenantId,
      },
    });

  if (!knowledge) {
    throw new Error(
      "KNOWLEDGE_NOT_FOUND"
    );
  }

  return knowledge;
}

export async function createKnowledge(
  tenantId: string,
  data: Record<string, unknown>
) {
  if (!tenantId?.trim()) {
    throw new Error(
      "TENANT_ID_REQUIRED"
    );
  }

  if (
    typeof data.title !== "string" ||
    !data.title.trim()
  ) {
    throw new Error(
      "TITLE_REQUIRED"
    );
  }

  if (
    typeof data.content !== "string" ||
    !data.content.trim()
  ) {
    throw new Error(
      "CONTENT_REQUIRED"
    );
  }

  const type: KnowledgeType =
    isValidKnowledgeType(data.type)
      ? data.type
      : "TEXT";

  const knowledge =
    await KnowledgeBase.create({
      id: randomUUID(),

      tenantId,

      title:
        data.title.trim(),

      content:
        data.content.trim(),

      type,

      source:
        typeof data.source === "string"
          ? data.source.trim() || null
          : null,

      isActive:
        typeof data.isActive ===
        "boolean"
          ? data.isActive
          : true,
    });

  return knowledge;
}

export async function updateKnowledge(
  tenantId: string,
  id: string,
  data: Record<string, unknown>
) {
  const knowledge =
    await getKnowledge(
      tenantId,
      id
    );

  const updateData: Record<
    string,
    unknown
  > = {};

  // Title
  if (
    typeof data.title === "string" &&
    data.title.trim()
  ) {
    updateData.title =
      data.title.trim();
  }

  // Content
  if (
    typeof data.content === "string" &&
    data.content.trim()
  ) {
    updateData.content =
      data.content.trim();
  }

  // Type
  if (
    isValidKnowledgeType(
      data.type
    )
  ) {
    updateData.type =
      data.type;
  }

  // Source
  if (
    typeof data.source === "string"
  ) {
    updateData.source =
      data.source.trim() || null;
  }

  // Active
  if (
    typeof data.isActive ===
    "boolean"
  ) {
    updateData.isActive =
      data.isActive;
  }

  await knowledge.update(
    updateData
  );

  return knowledge;
}

export async function deleteKnowledge(
  tenantId: string,
  id: string
) {
  const knowledge =
    await getKnowledge(
      tenantId,
      id
    );

  await knowledge.destroy();

  return true;
}