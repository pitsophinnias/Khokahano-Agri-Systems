import { Router } from "express";
import { authenticate, requireFarmer, requireAdmin } from "../../middleware/auth.js";
import * as SurveysController from "./surveys.controller.js";

const router = Router();

// ── Farmer routes ─────────────────────────────────────────────
router.post("/",   authenticate, requireFarmer, SurveysController.submitSurvey);
router.get( "/my", authenticate, requireFarmer, SurveysController.getMySurvey);

// ── Admin routes ──────────────────────────────────────────────
// Named routes must come before parameterised routes (route ordering rule)
router.post("/import", authenticate, requireAdmin, SurveysController.importSurveys);
router.get( "/groups", authenticate, requireAdmin, SurveysController.getGroupBreakdown);
router.get( "/",       authenticate, requireAdmin, SurveysController.getAllSurveys);

export default router;