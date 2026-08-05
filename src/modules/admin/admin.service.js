// ---------------------------------------------------------------------------
// admin.service.js — business logic extracted from admin.routes.js
// ---------------------------------------------------------------------------
import prisma from "../../config/db.js";

export async function getDashboardStats() {
  const [farmers, buyers, products, orders, escalations, revenue] = await Promise.all([
    prisma.farmer.count(),
    prisma.buyer.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.escalation.count({ where: { isResolved: false } }),
    prisma.order.aggregate({
      where: { status: "COMPLETED" },
      _sum:  { totalAmount: true },
    }),
  ]);

  // Orders by status
  const byStatus = await prisma.order.groupBy({
    by:     ["status"],
    _count: { id: true },
  });

  return {
    farmers, buyers, products, orders,
    openEscalations: escalations,
    totalRevenue:    revenue._sum.totalAmount ?? 0,
    ordersByStatus:  Object.fromEntries(byStatus.map((s) => [s.status, s._count.id])),
  };
}

export async function getRevenueByDistrict() {
  const orders = await prisma.order.findMany({
    where: { status: "COMPLETED" },
    include: {
      farmer: { include: { user: { select: { district: true } } } },
    },
  });

  const map = {};
  orders.forEach((o) => {
    const d = o.farmer.user.district;
    map[d] = (map[d] ?? 0) + o.totalAmount;
  });

  return Object.entries(map)
    .map(([district, revenue]) => ({ district, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}