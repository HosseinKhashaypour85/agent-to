import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";

import {
  createKnowledge,
  getKnowledgeList,
  getKnowledgeById,
  deleteKnowledge,
} from "./knowledge.service";

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

    const {
      title,
      content,
      type,
      source,
    } = req.body || {};

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "title and content are required",
      });
    }

    const knowledge = await createKnowledge({
      tenantId: req.user.tenantId,
      title,
      content,
      type,
      source,
    });

    return res.status(201).json({
      success: true,
      data: knowledge,
    });
  } catch (error) {
    console.error("Create Knowledge Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

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

    const knowledge = await getKnowledgeList(
      req.user.tenantId
    );

    return res.status(200).json({
      success: true,
      data: knowledge,
    });
  } catch (error) {
    console.error("Get Knowledge Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getOne(
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

    const knowledge = await getKnowledgeById(
       req.user.tenantId,
       String(req.params.id)
    );

    return res.status(200).json({
      success: true,
      data: knowledge,
    });
  } catch (error: any) {
    if (error.message === "KNOWLEDGE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Knowledge not found",
      });
    }

    console.error("Get Knowledge Error:", error);

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
      message: "Knowledge deleted successfully",
    });
  } catch (error: any) {
    if (error.message === "KNOWLEDGE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Knowledge not found",
      });
    }

    console.error("Delete Knowledge Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}