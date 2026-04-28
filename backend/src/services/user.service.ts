import prisma from "../db/client.js";

export async function getOrganizers() {
  return prisma.user.findMany({
    where: {
      role: "ORGANIZER",
      is_active: true,
      organizer_approved: true,
    },
    select: {
      id: true,
      full_name: true,
      email: true,
      avatar_url: true,
      _count: {
        select: {
          events: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });
}

export async function getOrganizerById(id: string) {
  return prisma.user.findFirst({
    where: {
      id,
      role: "ORGANIZER",
      is_active: true,
      organizer_approved: true,
    },
    select: {
      id: true,
      full_name: true,
      email: true,
      avatar_url: true,
      _count: {
        select: {
          events: true,
        },
      },
    },
  });
}

export async function getPendingOrganizers() {
  return prisma.user.findMany({
    where: {
      role: "ORGANIZER",
      organizer_approved: false,
      is_active: true,
    },
    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
      created_at: true,
    },
    orderBy: {
      created_at: "asc",
    },
  });
}

export async function approveOrganizerAccount(userId: string) {
  return prisma.user.updateMany({
    where: {
      id: userId,
      role: "ORGANIZER",
      organizer_approved: false,
    },
    data: {
      organizer_approved: true,
    },
  });
}
