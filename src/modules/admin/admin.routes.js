import { Router }  from "express";
import { authenticate, requireAdmin } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/errorHandler.js";
import prisma from "../../config/db.js";

const router = Router();

// All admin routes require admin role
router.use(authenticate, requireAdmin);

// ── DASHBOARD STATS ───────────────────────────────────────────
router.get("/stats", asyncHandler(async (req, res) => {
  const [farmers, buyers, products, orders, escalations] = await Promise.all([
    prisma.farmer.count(),
    prisma.buyer.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.escalation.count({ where: { isResolved: false } }),
  ]);

  const revenue = await prisma.order.aggregate({
    where: { status: "COMPLETED" },
    _sum: { totalAmount: true },
  });

  res.json({
    farmers, buyers, products, orders,
    openEscalations: escalations,
    totalRevenue: revenue._sum.totalAmount ?? 0,
  });
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
  const where = {
    ...(status   && { status: status.toUpperCase() }),
    ...(district && { farmer: { user: { district } } }),
  };
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { placedAt: "desc" },
      skip: (+page - 1) * +limit,
      take: +limit,
      include: {
        buyer:  { include: { user: { select: { firstName: true, lastName: true, phone: true, district: true } } } },
        farmer: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } },
        items:  { include: { product: { select: { title: true } } } },
      },
    }),
    prisma.order.count({ where }),
  ]);
  res.json({ orders, total, page: +page, pages: Math.ceil(total / +limit) });
}));

export default router;