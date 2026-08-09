import { Router } from "express";
import { authenticate, requireFarmer } from "../../middleware/auth.js";
import { uploadProductImages } from "../../middleware/upload.js";
import * as ProductsController from "./products.controller.js";

const router = Router();

// ── Specific named routes MUST come before /:id ───────────────
// Farmer's own listings
router.get(   "/my/listings", authenticate, requireFarmer, ProductsController.getMyProducts);
router.post(  "/my",          authenticate, requireFarmer, uploadProductImages, ProductsController.createProduct);
router.put(   "/my/:id",      authenticate, requireFarmer, ProductsController.updateProduct);
router.delete("/my/:id",      authenticate, requireFarmer, ProductsController.deleteProduct);
router.patch( "/my/:id/stock",authenticate, requireFarmer, ProductsController.updateStock);

// ── Public routes ─────────────────────────────────────────────
router.get("/stats", ProductsController.getMarketplaceStats);
router.get("/",     ProductsController.getProducts);
router.get("/:id", ProductsController.getProductById);

export default router;