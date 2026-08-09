// ---------------------------------------------------------------------------
// auth.routes.js
// ---------------------------------------------------------------------------
import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import * as AuthController from "./auth.controller.js";

const router = Router();

// Public routes
router.post("/register/farmer", AuthController.registerFarmer);
router.post("/register/buyer",  AuthController.registerBuyer);
router.post("/login",           AuthController.login);

// Protected routes
router.get( "/me",              authenticate, AuthController.getMe);
router.put( "/change-password", authenticate, AuthController.changePassword);

export default router;