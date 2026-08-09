import { Router } from "express";
import { authenticate, requireFarmer, requireBuyer } from "../../middleware/auth.js";
import * as OrdersController from "./orders.controller.js";

const router = Router();

// Buyer
router.post("/",           authenticate, requireBuyer,  OrdersController.placeOrder);
router.get( "/my/buyer",   authenticate, requireBuyer,  OrdersController.getMyOrdersAsBuyer);

// Farmer
router.get( "/my/farmer",  authenticate, requireFarmer, OrdersController.getMyOrdersAsFarmer);
router.get( "/my/stats",   authenticate, requireFarmer, OrdersController.getFarmerStats);
router.patch("/:id/status",authenticate, requireFarmer, OrdersController.updateOrderStatus);

// Shared (farmer or buyer who owns the order)
router.get( "/:id",        authenticate, OrdersController.getOrderById);

export default router;