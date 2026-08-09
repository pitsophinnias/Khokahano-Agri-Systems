import { asyncHandler } from "../../middleware/errorHandler.js";
import * as ProductsService from "./products.service.js";

export const getProducts = asyncHandler(async (req, res) => {
  const { category, district, q: query, sort, page, limit } = req.query;
  const result = await ProductsService.getProducts({ category, district, query, sort, page, limit });
  res.json(result);
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await ProductsService.getProductById(req.params.id);
  res.json(product);
});

export const getMyProducts = asyncHandler(async (req, res) => {
  const products = await ProductsService.getFarmerProducts(req.user.farmer.id, { includeInactive: true });
  res.json(products);
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await ProductsService.createProduct(req.user.farmer.id, req.body, req.files ?? []);
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await ProductsService.updateProduct(req.params.id, req.user.farmer.id, req.body);
  res.json(product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const result = await ProductsService.deactivateProduct(req.params.id, req.user.farmer.id);
  res.json(result);
});

export const updateStock = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  if (quantity === undefined) return res.status(400).json({ error: "quantity is required" });
  const result = await ProductsService.updateStock(req.params.id, req.user.farmer.id, quantity);
  res.json(result);
});

export const getMarketplaceStats = asyncHandler(async (req, res) => {
  const stats = await ProductsService.getMarketplaceStats();
  res.json(stats);
});