// ---------------------------------------------------------------------------
// orders.escalation.js
// Starts a 10-minute timer when an order is placed.
// If the farmer doesn't respond, the order is escalated.
// ---------------------------------------------------------------------------
import prisma from "../../config/db.js";
import { createNotification } from "../notifications/notifications.service.js";

const ESCALATION_MS = 10 * 60 * 1000; // 10 minutes
const REMINDER_MS   =  5 * 60 * 1000; //  5 minutes

// In-memory timers — in production replace with a job queue (Bull/BullMQ)
const escalationTimers = new Map();
const reminderTimers   = new Map();

export function triggerEscalation(orderId, farmerId) {
  // 5-minute reminder
  const reminderTimer = setTimeout(async () => {
    try {
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order || !["PENDING"].includes(order.status)) return;

      const farmer = await prisma.farmer.findUnique({
        where: { id: farmerId }, include: { user: true },
      });
      await createNotification({
        userId:  farmer.userId,
        type:    "order_reminder",
        title:   "Order waiting — 5 minutes",
        message: `You have an order that has been waiting 5 minutes. Please respond soon.`,
        data:    { orderId },
      });
    } catch (e) {
      console.error("Reminder error:", e.message);
    }
  }, REMINDER_MS);

  reminderTimers.set(orderId, reminderTimer);

  // 10-minute escalation
  const escalationTimer = setTimeout(async () => {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { farmer: { include: { user: true } }, buyer: { include: { user: true } } },
      });

      if (!order || !["PENDING"].includes(order.status)) return;

      // Mark order as escalated
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: orderId },
          data:  { status: "ESCALATED", escalatedAt: new Date() },
        });

        await tx.orderStatusLog.create({
          data: { orderId, fromStatus: "PENDING", toStatus: "ESCALATED", triggeredBy: "system" },
        });

        // Create escalation record
        await tx.escalation.upsert({
          where:  { orderId },
          create: { orderId, farmerId },
          update: {},
        });
      });

      // Notify Khokahano admins
      const admins = await prisma.admin.findMany({ include: { user: true } });
      for (const admin of admins) {
        await createNotification({
          userId:  admin.userId,
          type:    "escalation",
          title:   "🚨 Farmer not responding",
          message: `${order.farmer.user.firstName} ${order.farmer.user.lastName} has not responded to an order from ${order.buyer.user.firstName} ${order.buyer.user.lastName} within 10 minutes.`,
          data:    { orderId, farmerId },
        });
      }

      // Notify farmer
      await createNotification({
        userId:  order.farmer.userId,
        type:    "escalation",
        title:   "⚠️ Order escalated",
        message: "An order has been escalated to Khokahano because it was not responded to in time. Please respond immediately.",
        data:    { orderId },
      });

      console.log(`[Escalation] Order ${orderId} escalated at ${new Date().toISOString()}`);
    } catch (e) {
      console.error("Escalation error:", e.message);
    }
  }, ESCALATION_MS);

  escalationTimers.set(orderId, escalationTimer);
}

// Call this when a farmer accepts or declines — stops the timers
export function cancelEscalation(orderId) {
  const et = escalationTimers.get(orderId);
  const rt = reminderTimers.get(orderId);
  if (et) { clearTimeout(et); escalationTimers.delete(orderId); }
  if (rt) { clearTimeout(rt); reminderTimers.delete(orderId);   }
}