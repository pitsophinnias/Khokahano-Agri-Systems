// ---------------------------------------------------------------------------
// farmers.controller.js
// ---------------------------------------------------------------------------
import { asyncHandler } from "../../middleware/errorHandler.js";
import * as FarmersService from "./farmers.service.js";

export const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await FarmersService.getFarmerProfile(req.user.farmer.id);
  res.json(profile);
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const profile = await FarmersService.updateFarmerProfile(
    req.user.farmer.id, req.user.id, req.body
  );
  res.json(profile);
});

export const updateProfilePhoto = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No image uploaded" });
  const result = await FarmersService.updateProfilePhoto(req.user.farmer.id, req.file.filename);
  res.json(result);
});

export const getPublicFarmers = asyncHandler(async (req, res) => {
  const { district, page, limit } = req.query;
  const result = await FarmersService.getPublicFarmers({ district, page: +page, limit: +limit });
  res.json(result);
});

export const getPublicFarmerById = asyncHandler(async (req, res) => {
  const farmer = await FarmersService.getFarmerProfile(req.params.id);
  res.json(farmer);
});