import { Request, Response } from "express";

import {
  getDashboardStats,
} from "./dashboard-stats.service";

export async function getDashboardStatsController(
  _req: Request,
  res: Response
) {
  try {
    const data = await getDashboardStats();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "GET DASHBOARD STATS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get dashboard stats",
    });
  }
}
