import { asyncHandler } from "../../middleware/errorHandler.js";
import * as AdminService from "./admin.service.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await AdminService.getDashboardStats();
  res.json(stats);
});

export const getRevenueByDistrict = asyncHandler(async (req, res) => {
  const data = await AdminService.getRevenueByDistrict();
  res.json(data);
});