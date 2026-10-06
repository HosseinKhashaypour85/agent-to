import { Request, Response } from "express";

import {
  getBusinessOverview,
} from "./business-overview.service";

export async function getBusinessOverviewController(
  req: Request,
  res: Response
) {
  try {
    const overview = await getBusinessOverview(
      String(req.params.id)
    );

    return res.status(200).json({
      success: true,
      data: overview,
    });
  } catch (error: any) {
    console.error(
      "GET BUSINESS OVERVIEW ERROR:",
      error
    );

    console.error(
      "ERROR MESSAGE:",
      error?.message
    );

    console.error(
      "ERROR STACK:",
      error?.stack
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get business overview",
      error:
        process.env.NODE_ENV === "production"
          ? undefined
          : error?.message,
    });
  }
}