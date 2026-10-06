import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";

import {
  createKnowledge,
  deleteKnowledge,
  getKnowledge,
  getKnowledgeList,
  updateKnowledge,
} from "./agent-knowledge.service";

export async function list(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await getKnowledgeList(
      req.user.tenantId,
      {
        search:
          typeof req.query.search === "string"
            ? req.query.search
            : undefined,

        type:
          typeof req.query.type === "string"
            ? req.query.type
            : undefined,

        isActive:
          req.query.isActive === undefined
            ? undefined
            : req.query.isActive === "true",

        page:
          typeof req.query.page === "string"
            ? Number(req.query.page)
            : undefined,

        limit:
          typeof req.query.limit === "string"
            ? Number(req.query.limit)
            : undefined,
      }
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error(
      "GET KNOWLEDGE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function get(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const knowledge =
      await getKnowledge(
        req.user.tenantId,
        String(req.params.id)
      );

    return res.status(200).json({
      success: true,
      knowledge,
    });
  } catch (error: any) {
    console.error(
      "GET KNOWLEDGE ITEM ERROR:",
      error
    );

    if (
      error?.message ===
      "KNOWLEDGE_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Knowledge not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function create(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const knowledge =
      await createKnowledge(
        req.user.tenantId,
        req.body || {}
      );

    return res.status(201).json({
      success: true,
      message:
        "Knowledge created successfully",
      knowledge,
    });
  } catch (error: any) {
    console.error(
      "CREATE KNOWLEDGE ERROR:",
      error
    );

    if (
      error?.message ===
      "TITLE_REQUIRED"
    ) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (
      error?.message ===
      "CONTENT_REQUIRED"
    ) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function update(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const knowledge =
      await updateKnowledge(
        req.user.tenantId,
        String(req.params.id),
        req.body || {}
      );

    return res.status(200).json({
      success: true,
      message:
        "Knowledge updated successfully",
      knowledge,
    });
  } catch (error: any) {
    console.error(
      "UPDATE KNOWLEDGE ERROR:",
      error
    );

    if (
      error?.message ===
      "KNOWLEDGE_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Knowledge not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function remove(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await deleteKnowledge(
      req.user.tenantId,
      String(req.params.id)
    );

    return res.status(200).json({
      success: true,
      message:
        "Knowledge deleted successfully",
    });
  } catch (error: any) {
    console.error(
      "DELETE KNOWLEDGE ERROR:",
      error
    );

    if (
      error?.message ===
      "KNOWLEDGE_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Knowledge not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}