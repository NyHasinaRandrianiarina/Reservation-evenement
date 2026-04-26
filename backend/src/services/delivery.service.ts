import prisma from "../db/client.js";
import crypto from "crypto";

export type CreateDeliveryInput = {
  description: string;
  weight?: number | null;
  pickup_address: string;
  delivery_address: string;
  recipient_name: string;
  recipient_phone: string;
};

function generateTrackingNumber(): string {
  // e.g., TRK-A83KZ1
  const randomStr = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `TRK-${randomStr}`;
}

export async function createDelivery(senderId: string, input: CreateDeliveryInput) {
  let trackingNumber = generateTrackingNumber();
  let unique = false;

  // Assure unique tracking number
  while (!unique) {
    const existing = await prisma.delivery.findUnique({
      where: { tracking_number: trackingNumber }
    });
    if (existing) {
      trackingNumber = generateTrackingNumber();
    } else {
      unique = true;
    }
  }

  const delivery = await prisma.delivery.create({
    data: {
      tracking_number: trackingNumber,
      description: input.description,
      weight: input.weight ?? null,
      pickup_address: input.pickup_address,
      delivery_address: input.delivery_address,
      recipient_name: input.recipient_name,
      recipient_phone: input.recipient_phone,
      sender_id: senderId,
      status: "PENDING",
      events: {
        create: {
          status: "PENDING",
          note: "Demande de livraison créée",
          actor_id: senderId,
        }
      }
    },
    include: {
      events: true,
      sender: {
        select: { id: true, first_name: true, last_name: true, phone: true }
      }
    }
  });

  return delivery;
}

/**
 * Récupère toutes les livraisons (Admin).
 * Inclut le sender et le driver pour l'affichage.
 */
export async function getAllDeliveries(filters?: { status?: string }) {
  const where: Record<string, unknown> = {};
  if (filters?.status) {
    where.status = filters.status;
  }

  return prisma.delivery.findMany({
    where,
    orderBy: { created_at: "desc" },
    include: {
      sender: {
        select: { id: true, first_name: true, last_name: true, phone: true, email: true },
      },
      driver: {
        select: { id: true, first_name: true, last_name: true, phone: true },
      },
      events: {
        orderBy: { created_at: "desc" },
        take: 1,
      },
    },
  });
}

/**
 * Récupère la liste des livreurs disponibles (rôle DELIVERY).
 */
export async function getAvailableDrivers() {
  return prisma.user.findMany({
    where: { role: "DELIVERY", is_active: true },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      phone: true,
      zone: true,
    },
    orderBy: { first_name: "asc" },
  });
}

/**
 * Assigner un livreur à une livraison (Admin).
 * Change le statut en ASSIGNED et crée un événement.
 */
export async function assignDriver(deliveryId: string, driverId: string, adminId: string) {
  // Vérifier que la livraison existe
  const delivery = await prisma.delivery.findUnique({ where: { id: deliveryId } });
  if (!delivery) throw new Error("Livraison introuvable");

  // Vérifier que le livreur existe et a le bon rôle
  const driver = await prisma.user.findUnique({ where: { id: driverId } });
  if (!driver || driver.role !== "DELIVERY") throw new Error("Livreur invalide");

  // Mettre à jour la livraison et créer l'événement en transaction
  const updated = await prisma.$transaction([
    prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        driver_id: driverId,
        status: "ASSIGNED",
      },
      include: {
        sender: {
          select: { id: true, first_name: true, last_name: true, phone: true, email: true },
        },
        driver: {
          select: { id: true, first_name: true, last_name: true, phone: true },
        },
      },
    }),
    prisma.deliveryEvent.create({
      data: {
        delivery_id: deliveryId,
        status: "ASSIGNED",
        actor_id: adminId,
        note: `Livreur ${driver.first_name} ${driver.last_name} assigné`,
      },
    }),
  ]);

  return updated[0];
}

/**
 * Récupère les livraisons d'un livreur spécifique.
 */
export async function getDriverDeliveries(driverId: string, filters?: { status?: string }) {
  const where: any = { driver_id: driverId };
  if (filters?.status) {
    where.status = filters.status;
  }

  return prisma.delivery.findMany({
    where,
    orderBy: { updated_at: "desc" },
    include: {
      sender: {
        select: { id: true, first_name: true, last_name: true, phone: true },
      },
    },
  });
}

/**
 * Met à jour le statut d'une livraison.
 */
export async function updateStatus(deliveryId: string, status: any, actorId: string, note?: string) {
  const delivery = await prisma.delivery.findUnique({ where: { id: deliveryId } });
  if (!delivery) throw new Error("Livraison introuvable");

  // Si c'est un livreur, on vérifie qu'il est bien assigné
  const user = await prisma.user.findUnique({ where: { id: actorId } });
  if (user?.role === "DELIVERY" && delivery.driver_id !== actorId) {
    throw new Error("Vous n'êtes pas assigné à cette livraison");
  }

  const updated = await prisma.$transaction([
    prisma.delivery.update({
      where: { id: deliveryId },
      data: { status },
      include: {
        sender: {
          select: { id: true, first_name: true, last_name: true, phone: true },
        },
        driver: {
          select: { id: true, first_name: true, last_name: true, phone: true },
        },
      },
    }),
    prisma.deliveryEvent.create({
      data: {
        delivery_id: deliveryId,
        status,
        actor_id: actorId,
        note: note || `Statut mis à jour en ${status}`,
      },
    }),
  ]);

  return updated[0];
}

