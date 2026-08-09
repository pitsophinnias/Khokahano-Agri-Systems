// ---------------------------------------------------------------------------
// farmers.routes.js
// ---------------------------------------------------------------------------
import { Router } from "express";
import { authenticate, requireFarmer } from "../../middleware/auth.js";
import { uploadProductImages } from "../../middleware/upload.js";
import * as FarmersController from "./farmers.controller.js";

const router = Router();

// ── Farmer-only routes (named — must come before /:id) ────────
router.get( "/me/profile", authenticate, requireFarmer, FarmersController.getMyProfile);
router.put( "/me/profile", authenticate, requireFarmer, FarmersController.updateMyProfile);
router.post("/me/photo",   authenticate, requireFarmer,
  uploadProductImages,
  FarmersController.updateProfilePhoto
);

// ── Public routes ─────────────────────────────────────────────
router.get("/",    FarmersController.getPublicFarmers);
router.get("/:id", FarmersController.getPublicFarmerById);

export default router;