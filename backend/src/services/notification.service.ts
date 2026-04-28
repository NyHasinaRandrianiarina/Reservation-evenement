import prisma from "../db/client.js";
import type { Prisma } from "@prisma/client";
import { ForbiddenError, NotFoundError } from "../errors/app-error.js";

interface NotificationPayload {
  type: string;
  title: string;
  message: string;
  metadata?: Prisma.InputJsonValue;
}

export async function createNotificationForUser(
  userId: string,
  payload: NotificationPayload
) {
  return prisma.notification.create({
    data: {
      user_id: userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      ...(payload.metadata ? { metadata: payload.metadata } : {}),
    },
  });
}

export async function createBroadcastNotification(payload: NotificationPayload) {
  return prisma.notification.create({
    data: {
      user_id: null,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      ...(payload.metadata ? { metadata: payload.metadata } : {}),
    },
  });
}

export async function notifyAdmins(payload: NotificationPayload) {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", is_active: true },
    select: { id: true },
  });

  if (admins.length === 0) return;

  await prisma.notification.createMany({
    data: admins.map((admin) => ({
      user_id: admin.id,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      ...(payload.metadata ? { metadata: payload.metadata } : {}),
    })),
  });
}

export async function listNotificationsForUser(userId: string) {
  return prisma.notification.findMany({
    where: {
      OR: [{ user_id: userId }, { user_id: null }],
    },
    orderBy: { created_at: "desc" },
    take: 50,
  });
}

export async function markNotificationAsRead(userId: string, notificationId: string) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { id: true, user_id: true, read_at: true },
  });

  if (!notification) {
    throw new NotFoundError("Notification introuvable");
  }

  if (notification.user_id !== null && notification.user_id !== userId) {
    throw new ForbiddenError("Vous ne pouvez pas modifier cette notification");
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { read_at: notification.read_at ?? new Date() },
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: {
      read_at: null,
      OR: [{ user_id: userId }, { user_id: null }],
    },
    data: { read_at: new Date() },
  });
}
