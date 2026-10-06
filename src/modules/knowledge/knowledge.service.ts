import KnowledgeBase, {
  KnowledgeType,
} from "../../models/KnowledgeBase";

import { Op } from "sequelize";

// ============================================================
// Create Knowledge
// ============================================================

export async function createKnowledge(data: {
  tenantId: string;
  title: string;
  content: string;
  type?: KnowledgeType;
  source?: string;
}) {
  return KnowledgeBase.create({
    tenantId: data.tenantId,
    title: data.title,
    content: data.content,
    type: data.type || "TEXT",
    source: data.source || null,
    isActive: true,
  });
}

// ============================================================
// Get Knowledge List
// ============================================================

export async function getKnowledgeList(
  tenantId: string
) {
  return KnowledgeBase.findAll({
    where: {
      tenantId,
    },

    order: [
      ["createdAt", "DESC"],
    ],
  });
}

// ============================================================
// Get Knowledge By ID
// ============================================================

export async function getKnowledgeById(
  tenantId: string,
  id: string
) {
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

// ============================================================
// Delete Knowledge
// ============================================================

export async function deleteKnowledge(
  tenantId: string,
  id: string
) {
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

  await knowledge.destroy();

  return true;
}

// ============================================================
// Normalize Persian Text
// ============================================================

function normalizeText(
  text: string
) {
  return text
    .toLowerCase()

    // Arabic ي → Persian ی
    .replace(/ي/g, "ی")

    // Arabic ك → Persian ک
    .replace(/ك/g, "ک")

    // نیم‌فاصله
    .replace(/\u200c/g, " ")

    // حذف علائم
    .replace(/[؟?!.,،؛:()[\]{}"']/g, " ")

    // فاصله‌های اضافه
    .replace(/\s+/g, " ")

    .trim();
}

// ============================================================
// Remove Common Persian Question Words
// ============================================================

function extractKeywords(
  query: string
) {
  const stopWords = new Set([
    "و",
    "یا",
    "از",
    "به",
    "در",
    "برای",
    "با",
    "که",
    "را",
    "این",
    "آن",
    "یک",
    "من",
    "ما",
    "شما",
    "چطور",
    "چطوری",
    "چگونه",
    "چی",
    "چیه",
    "چه",
    "آیا",
    "لطفا",
    "لطفاً",
    "می",
    "میشه",
    "میشود",
    "است",
    "هست",
    "درباره",
    "مورد",
    "کنم",
    "کنید",
    "کرد",
    "دارید",
    "دارند",
  ]);

  return normalizeText(query)
    .split(/\s+/)
    .filter(
      (word) =>
        word.length >= 2 &&
        !stopWords.has(word)
    );
}

// ============================================================
// Search Knowledge
// ============================================================

export async function searchKnowledge(
  tenantId: string,
  query: string
) {
  if (!tenantId?.trim()) {
    return [];
  }

  if (!query?.trim()) {
    return [];
  }

  const keywords =
    extractKeywords(query);

  if (keywords.length === 0) {
    return [];
  }

  // ----------------------------------------------------------
  // Build OR conditions
  // ----------------------------------------------------------

  const conditions =
    keywords.flatMap((word) => [
      {
        title: {
          [Op.like]: `%${word}%`,
        },
      },

      {
        content: {
          [Op.like]: `%${word}%`,
        },
      },
    ]);

  const results =
    await KnowledgeBase.findAll({
      where: {
        tenantId,

        isActive: true,

        [Op.or]: conditions,
      },

      order: [
        ["createdAt", "DESC"],
      ],

      limit: 20,
    });

  // ----------------------------------------------------------
  // Rank results
  // ----------------------------------------------------------

  const normalizedKeywords =
    keywords.map((word) =>
      normalizeText(word)
    );

  const ranked =
    results.map((item) => {
      const title =
        normalizeText(
          item.title
        );

      const content =
        normalizeText(
          item.content
        );

      let score = 0;

      for (const keyword of normalizedKeywords) {
        // Match in title = stronger
        if (
          title.includes(keyword)
        ) {
          score += 5;
        }

        // Match in content
        if (
          content.includes(keyword)
        ) {
          score += 2;
        }
      }

      return {
        item,
        score,
      };
    });

  ranked.sort(
    (a, b) =>
      b.score - a.score
  );

  // فقط نتایج واقعاً مرتبط
  return ranked
    .filter(
      (result) =>
        result.score > 0
    )
    .slice(0, 5)
    .map(
      (result) =>
        result.item
    );
}