import { asyncHandler } from "../../middleware/errorHandler.js";
import * as OrdersService from "./orders.service.js";

export const placeOrder = asyncHandler(async (req, res) => {
  const order = await OrdersService.placeOrder(req.user.buyer.id, req.body);
  res.status(201).json(order);
});

export const getMyOrdersAsBuyer = asyncHandler(async (req, res) => {
  const orders = await OrdersService.getBuyerOrders(req.user.buyer.id);
  res.json(orders);
});

export const getMyOrdersAsFarmer = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.query;
  const result = await OrdersService.getFarmerOrders(req.user.farmer.id, { status, page: +page, limit: +limit });
  res.json(result);
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await OrdersService.getOrderById(req.params.id);
  res.json(order);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, declineReason, declineReasonKey } = req.body;
  if (!status) return res.status(400).json({ error: "status is required" });
  const order = await OrdersService.updateOrderStatus(
    req.params.id, req.user.farmer.id, status.toUpperCase(),
    { declineReason, declineReasonKey },
  );
  res.json(order);
});

export const getFarmerStats = asyncHandler(async (req, res) => {
  const stats = await OrdersService.getFarmerStats(req.user.farmer.id);
  res.json(stats);
});