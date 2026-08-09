// ---------------------------------------------------------------------------
// notifications.service.js
// Creates notifications in the database and (in future) triggers SMS/WhatsApp
// ---------------------------------------------------------------------------
import prisma from "../../config/db.js";

export async function createNotification({ userId, type, title, message, data }) {
  return prisma.notification.create({
    data: { userId, type, title, message, data: data ?? {} },
  });
}

export async function getUserNotifications(userId, { unreadOnly = false } = {}) {
  return prisma.notification.findMany({
    where: { userId, ...(unreadOnly ? { isRead: false } : {}) },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function markAsRead(notificationId, userId) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data:  { isRead: true },
  });
}

export async function markAllAsRead(userId) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data:  { isRead: true },
  });
}

export async function getUnreadCount(userId) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}