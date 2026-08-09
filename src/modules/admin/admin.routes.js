import { Router } from "express";
import { authenticate, requireAdmin } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/errorHandler.js";
import * as AdminService from "./admin.service.js";
import prisma from "../../config/db.js";

const router = Router();

// All admin routes require admin role
router.use(authenticate, requireAdmin);

// ── DASHBOARD STATS ───────────────────────────────────────────
// Now delegates to AdminService so ordersByStatus is included
router.get("/stats", asyncHandler(async (req, res) => {
  const stats = await AdminService.getDashboardStats();
  res.json(stats);
}));

// ── REVENUE BY DISTRICT ───────────────────────────────────────
router.get("/revenue-by-district", asyncHandler(async (req, res) => {
  const data = await AdminService.getRevenueByDistrict();
  res.json(data);
}));

// ── ALL ESCALATIONS ───────────────────────────────────────────
router.get("/escalations", asyncHandler(async (req, res) => {
  const { resolved } = req.query;
  const escalations = await prisma.escalation.findMany({
    where: resolved !== undefined ? { isResolved: resolved === "true" } : {},
    orderBy: { escalatedAt: "desc" },
    include: {
      order: {
        include: {
          buyer:  { include: { user: { select: { firstName: true, lastName: true, phone: true } } } },
          farmer: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } },
          items:  { include: { product: { select: { title: true } } } },
        },
      },
    },
  });
  res.json(escalations);
}));

// ── RESOLVE ESCALATION ────────────────────────────────────────
router.patch("/escalations/:id/resolve", asyncHandler(async (req, res) => {
  const { followUpNote } = req.body;
  const escalation = await prisma.escalation.update({
    where: { id: req.params.id },
    data:  { isResolved: true, resolvedAt: new Date(), followUpNote, resolvedBy: req.user.id },
  });
  res.json(escalation);
}));

// ── ALL FARMERS ───────────────────────────────────────────────
router.get("/farmers", asyncHandler(async (req, res) => {
  const { district } = req.query;
  const farmers = await prisma.farmer.findMany({
    where: district ? { user: { district } } : {},
    include: {
      user: { select: { firstName: true, lastName: true, email: true, phone: true, district: true, village: true, createdAt: true } },
      survey: true,
      _count: { select: { products: true, orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(farmers);
}));

// ── VERIFY FARMER ─────────────────────────────────────────────
router.patch("/farmers/:id/verify", asyncHandler(async (req, res) => {
  const farmer = await prisma.farmer.update({
    where: { id: req.params.id },
    data:  { isVerified: true, verifiedAt: new Date() },
  });
  res.json(farmer);
}));

// ── ALL ORDERS ────────────────────────────────────────────────
router.get("/orders", asyncHandler(async (req, res) => {
  const { status, district, page = 1, limit = 50 } = req.query;
  // Pagination rule: always use parseInt with fallback
  const safePage  = Math.max(1, parseInt(page)  || 1);
  const safeLimit = Math.max(1, parseInt(limit) || 50);
  const where = {
    ...(status   && { status: status.toUpperCase() }),
    ...(district && { farmer: { user: { district } } }),
  };
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { placedAt: "desc" },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      include: {
        buyer:  { include: { user: { select: { firstName: true, lastName: true, phone: true, district: true } } } },
        farmer: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } },
        items:  { include: { product: { select: { title: true } } } },
      },
    }),
    prisma.order.count({ where }),
  ]);
  res.json({ orders, total, page: safePage, pages: Math.ceil(total / safeLimit) });
}));

// ── SURVEYS ───────────────────────────────────────────────────
// GET all surveys with farmer info — for the admin surveys tab
router.get("/surveys", asyncHandler(async (req, res) => {
  const { district, group } = req.query;
  const surveys = await prisma.farmerSurvey.findMany({
    where: {
      ...(group    && { groupCategory: group }),
      ...(district && { farmer: { user: { district } } }),
    },
    include: {
      farmer: {
        include: {
          user: { select: { firstName: true, lastName: true, phone: true, district: true, village: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
  res.json(surveys);
}));

// GET group breakdown — counts per group with top challenges
router.get("/surveys/groups", asyncHandler(async (req, res) => {
  const groups = await prisma.farmerSurvey.groupBy({
    by:     ["groupCategory"],
    _count: { farmerId: true },
  });
  res.json(groups.map((g) => ({ group: g.groupCategory, count: g._count.farmerId })));
}));

export default router;