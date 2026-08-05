import { Router } from "express";
import { authenticate, requireFarmer, requireAdmin } from "../../middleware/auth.js";
import * as SurveysController from "./surveys.controller.js";

const router = Router();

// Farmer
router.post("/",    authenticate, requireFarmer, SurveysController.submitSurvey);
router.get( "/me",  authenticate, requireFarmer, SurveysController.getMySurvey);

// Admin
router.get( "/",       authenticate, requireAdmin, SurveysController.getAllSurveys);
router.get( "/groups", authenticate, requireAdmin, SurveysController.getGroupBreakdown);

export default router;