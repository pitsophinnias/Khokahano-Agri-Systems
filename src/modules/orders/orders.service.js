// ---------------------------------------------------------------------------
// orders.service.js
// ---------------------------------------------------------------------------
import prisma  from "../../config/db.js";
import { createNotification } from "../notifications/notifications.service.js";
import { triggerEscalation }  from "./orders.escalation.js";

// ── PLACE ORDER ───────────────────────────────────────────────
export async function placeOrder(buyerId, data) {
  const { items, deliveryMethod, deliveryAddress, deliveryPhone, paymentMethod, notes } = data;

  // Validate all items belong to the same farmer and are in stock
  const productIds = items.map((i) => i.productId);
  const products   = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });

  if (products.length !== productIds.length) {
    const err = new Error("One or more products are unavailable");
    err.status = 400;
    throw err;
  }

  // All items must be from the same farmer (one order = one farmer)
  const farmerIds = [...new Set(products.map((p) => p.farmerId))];
  if (farmerIds.length > 1) {
    const err = new Error("All items in one order must be from the same farmer");
    err.status = 400;
    throw err;
  }

  const farmerId = farmerIds[0];

  // Check stock and calculate totals
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (item.quantity < product.minOrderQty) {
      const err = new Error(`Minimum order for ${product.title} is ${product.minOrderQty}`);
      err.status = 400;
      throw err;
    }
    if (item.quantity > product.stockQuantity) {
      const err = new Error(`Only ${product.stockQuantity} units of ${product.title} available`);
      err.status = 400;
      throw err;
    }
  }

  const totalAmount = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + product.pricePerUnit * item.quantity;
  }, 0);

  // Create order and items in one transaction
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        buyerId, farmerId,
        deliveryMethod: deliveryMethod?.toUpperCase() ?? "PICKUP",
        deliveryAddress,
        deliveryPhone,
        paymentMethod:  paymentMethod?.toUpperCase() ?? "MPESA",
        totalAmount,
        notes,
        items: {
          create: items.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            return {
              productId: item.productId,
              quantity:  item.quantity,
              unitPrice: product.pricePerUnit,
              subtotal:  product.pricePerUnit * item.quantity,
            };
          }),
        },
      },
      include: { items: true },
    });

    // Log status creation
    await tx.orderStatusLog.create({
      data: { orderId: newOrder.id, toStatus: "PENDING", triggeredBy: buyerId },
    });

    return newOrder;
  });

  // Notify the farmer
  const farmer = await prisma.farmer.findUnique({
    where: { id: farmerId },
    include: { user: true },
  });
  await createNotification({
    userId:  farmer.userId,
    type:    "order_placed",
    title:   "New order received",
    message: `You have a new order for M ${totalAmount.toLocaleString()}. You have 10 minutes to respond.`,
    data:    { orderId: order.id },
  });

  // Start escalation timer
  triggerEscalation(order.id, farmerId);

  return getOrderById(order.id);
}

// ── UPDATE STATUS (farmer action) ─────────────────────────────
export async function updateOrderStatus(orderId, farmerId, newStatus, extra = {}) {
  const order = await prisma.order.findFirst({ where: { id: orderId, farmerId } });
  if (!order) {
    const err = new Error("Order not found");
    err.status = 404;
    throw err;
  }

  const timestamp = {
    ACCEPTED:  { acceptedAt:  new Date() },
    PREPARING: { preparingAt: new Date() },
    READY:     { readyAt:     new Date() },
    COMPLETED: { completedAt: new Date() },
    DECLINED:  { declinedAt:  new Date() },
  }[newStatus] ?? {};

  const updated = await prisma.$transaction(async (tx) => {
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data:  { status: newStatus, ...timestamp, ...extra },
      include: { buyer: { include: { user: true } } },
    });

    await tx.orderStatusLog.create({
      data: { orderId, fromStatus: order.status, toStatus: newStatus, triggeredBy: farmerId },
    });

    // Update farmer avg response time when accepted
    if (newStatus === "ACCEPTED" && order.placedAt) {
      const responseMs   = Date.now() - new Date(order.placedAt).getTime();
      const responseMins = responseMs / 60000;
      const farmer = await tx.farmer.findUnique({ where: { id: farmerId } });
      const newAvg = farmer.avgResponseMins
        ? (farmer.avgResponseMins + responseMins) / 2
        : responseMins;
      await tx.farmer.update({ where: { id: farmerId }, data: { avgResponseMins: newAvg } });
    }

    return updatedOrder;
  });

  // Notify the buyer
  const messages = {
    ACCEPTED:  "Your order has been accepted by the farmer! 🎉",
    PREPARING: "The farmer is preparing your order. 🐔",
    READY:     "Your order is ready! Arrange pickup or delivery. 📦",
    COMPLETED: "Your order has been completed. Thank you! 🙏",
    DECLINED:  `Your order was declined. Reason: ${extra.declineReason ?? "Not specified"}`,
  };

  if (messages[newStatus]) {
    await createNotification({
      userId:  updated.buyer.userId,
      type:    `order_${newStatus.toLowerCase()}`,
      title:   "Order update",
      message: messages[newStatus],
      data:    { orderId },
    });
  }

  return getOrderById(orderId);
}

// ── GET ORDER ─────────────────────────────────────────────────
export async function getOrderById(orderId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } } },
      buyer: { include: { user: { select: { firstName: true, lastName: true, phone: true, district: true, village: true } } } },
      farmer: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } },
      escalation: true,
    },
  });
  if (!order) {
    const err = new Error("Order not found");
    err.status = 404;
    throw err;
  }
  return formatOrder(order);
}

// ── FARMER'S ORDERS ───────────────────────────────────────────
export async function getFarmerOrders(farmerId, { status, page, limit } = {}) {
  const safePage  = Math.max(1, parseInt(page)  || 1);
  const safeLimit = Math.max(1, parseInt(limit) || 30);

  const where = {
    farmerId,
    ...(status && { status: status.toUpperCase() }),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { placedAt: "desc" },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      include: {
        items: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } } },
        buyer: { include: { user: { select: { firstName: true, lastName: true, phone: true, district: true, village: true } } } },
        escalation: true,
      },
    }),
    prisma.order.count({ where }),
  ]);

  return { orders: orders.map(formatOrder), total, page: safePage, pages: Math.ceil(total / safeLimit) };
}

// ── BUYER'S ORDERS ────────────────────────────────────────────
export async function getBuyerOrders(buyerId) {
  const orders = await prisma.order.findMany({
    where:   { buyerId },
    orderBy: { placedAt: "desc" },
    include: {
      items: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } } },
      farmer: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } },
    },
  });
  return orders.map(formatOrder);
}

// ── FARMER STATS ──────────────────────────────────────────────
export async function getFarmerStats(farmerId) {
  const orders = await prisma.order.findMany({ where: { farmerId } });

  const completed = orders.filter((o) => o.status === "COMPLETED");
  const declined  = orders.filter((o) => o.status === "DECLINED");
  const pending   = orders.filter((o) => ["PENDING", "ESCALATED"].includes(o.status));
  const active    = orders.filter((o) => ["ACCEPTED", "PREPARING", "READY"].includes(o.status));

  const totalRevenue = completed.reduce((s, o) => s + o.totalAmount, 0);
  const avgOrder     = completed.length ? totalRevenue / completed.length : 0;
  const fulfillRate  = (completed.length + declined.length) > 0
    ? (completed.length / (completed.length + declined.length)) * 100
    : 100;

  // Top buyers
  const buyerMap = {};
  completed.forEach((o) => {
    buyerMap[o.buyerId] = (buyerMap[o.buyerId] ?? 0) + o.totalAmount;
  });

  // District breakdown
  const districtMap = {};
  completed.forEach((o) => {
    if (o.deliveryAddress) {
      districtMap[o.deliveryAddress] = (districtMap[o.deliveryAddress] ?? 0) + 1;
    }
  });

  // Decline reasons
  const reasonMap = {};
  declined.forEach((o) => {
    const r = o.declineReason ?? "Not specified";
    reasonMap[r] = (reasonMap[r] ?? 0) + 1;
  });

  return {
    pending:     pending.length,
    active:      active.length,
    completed:   completed.length,
    declined:    declined.length,
    totalOrders: orders.length,
    totalRevenue,
    avgOrderValue: Math.round(avgOrder),
    fulfillmentRate: Math.round(fulfillRate),
    declineReasons: Object.entries(reasonMap).map(([reason, count]) => ({ reason, count })),
  };
}

// ── HELPERS ───────────────────────────────────────────────────
function formatOrder(o) {
  return {
    id:            o.id,
    status:        o.status,
    totalAmount:   o.totalAmount,
    currency:      o.currency,
    deliveryMethod: o.deliveryMethod,
    deliveryAddress: o.deliveryAddress,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    notes:         o.notes,
    declineReason: o.declineReason,
    placedAt:      o.placedAt,
    acceptedAt:    o.acceptedAt,
    preparingAt:   o.preparingAt,
    readyAt:       o.readyAt,
    completedAt:   o.completedAt,
    declinedAt:    o.declinedAt,
    escalatedAt:   o.escalatedAt,
    escalation:    o.escalation ?? null,
    items: o.items?.map((item) => ({
      id:           item.id,
      productId:    item.productId,
      productTitle: item.product ? { en: item.product.title, st: item.product.titleSt } : null,
      productImage: item.product?.images?.[0]?.url ?? null,
      quantity:     item.quantity,
      unitPrice:    item.unitPrice,
      subtotal:     item.subtotal,
    })) ?? [],
    buyer: o.buyer ? {
      id:       o.buyer.id,
      name:     `${o.buyer.user.firstName} ${o.buyer.user.lastName}`,
      phone:    o.buyer.user.phone,
      district: o.buyer.user.district,
      village:  o.buyer.user.village,
    } : null,
    farmer: o.farmer ? {
      id:    o.farmer.id,
      name:  `${o.farmer.user.firstName} ${o.farmer.user.lastName}`,
      phone: o.farmer.user.phone,
    } : null,
  };
}