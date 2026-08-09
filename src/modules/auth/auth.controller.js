// ---------------------------------------------------------------------------
// auth.controller.js — request/response handling for auth routes
// ---------------------------------------------------------------------------
import { asyncHandler } from "../../middleware/errorHandler.js";
import * as AuthService from "./auth.service.js";

export const registerFarmer = asyncHandler(async (req, res) => {
  const { email, phone, password, firstName, lastName, district, village, farmName } = req.body;

  // Basic validation
  if (!email || !phone || !password || !firstName || !lastName || !district) {
    return res.status(400).json({ error: "email, phone, password, firstName, lastName, and district are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  const result = await AuthService.registerFarmer({ email, phone, password, firstName, lastName, district, village, farmName });
  res.status(201).json(result);
});

export const registerBuyer = asyncHandler(async (req, res) => {
  const { email, phone, password, firstName, lastName, district, village } = req.body;

  if (!email || !phone || !password || !firstName || !lastName || !district) {
    return res.status(400).json({ error: "email, phone, password, firstName, lastName, and district are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  const result = await AuthService.registerBuyer({ email, phone, password, firstName, lastName, district, village });
  res.status(201).json(result);
});

export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: "identifier (email or phone) and password are required" });
  }
  const result = await AuthService.login(identifier, password);
  res.json(result);
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await AuthService.getMe(req.user.id);
  res.json(user);
});

export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: "oldPassword and newPassword are required" });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters" });
  }
  const result = await AuthService.changePassword(req.user.id, oldPassword, newPassword);
  res.json(result);
});