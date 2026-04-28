import prisma from "../db/client.js";

export async function getOrganizers() {
  return prisma.user.findMany({
    where: {
      role: "ORGANIZER",
      is_active: true,
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
