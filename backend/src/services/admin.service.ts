import prisma from "../db/client.js";

/**
 * Statistiques globales de la plateforme pour l'admin
 */
export async function getAdminStats() {
  const [
    totalEvents,
    totalUsers,
    totalRegistrations,
    pendingOrganizers,
    eventsByStatus,
    eventsByCategory,
    recentRegistrations,
  ] = await Promise.all([
    prisma.event.count(),
    prisma.user.count({ where: { is_active: true } }),
    prisma.registration.count(),
    prisma.user.count({ where: { role: "ORGANIZER", organizer_approved: false, is_active: true } }),
    prisma.event.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.event.groupBy({ by: ["category"], _count: { _all: true } }),
    // Registrations des 6 derniers mois
    prisma.$queryRaw<{ month: string; count: bigint }[]>`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') as month,
        COUNT(*)::bigint as count
      FROM "Registration"
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at) ASC
    `,
  ]);

  // Top Organisateurs par nombre d'inscriptions
  const topOrganizers = await prisma.user.findMany({
    where: { role: "ORGANIZER", organizer_approved: true, is_active: true },
    select: {
      id: true,
      full_name: true,
      avatar_url: true,
      _count: {
        select: { events: true },
      },
      events: {
        select: {
          _count: { select: { registrations: true } },
        },
      },
    },
    orderBy: { events: { _count: "desc" } },
    take: 5,
  });

  const eventsByStatusMap: Record<string, number> = {};
  for (const row of eventsByStatus) {
    eventsByStatusMap[row.status] = row._count._all;
  }

  return {
    totalEvents,
    totalUsers,
    totalRegistrations,
    pendingOrganizers,
    eventsByStatus: eventsByStatusMap,
    eventsByCategory: eventsByCategory.map(row => ({
      category: row.category,
      count: row._count._all,
    })),
    registrationsByMonth: recentRegistrations.map(row => ({
      month: row.month,
      count: Number(row.count),
    })),
    topOrganizers: topOrganizers.map(org => ({
      id: org.id,
      name: org.full_name,
      avatar_url: org.avatar_url,
      eventsCount: org._count.events,
      registrationsCount: org.events.reduce((sum, e) => sum + e._count.registrations, 0),
    })),
  };
}

/**
 * Liste paginée de tous les événements (admin)
 */
export async function getAllEventsAdmin(filters: {
  status?: string | undefined;
  category?: string | undefined;
  organizer_id?: string | undefined;
  search?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}) {
  const { status, category, organizer_id, search, page = 1, limit = 20 } = filters;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (category) where.category = category;
  if (organizer_id) where.organizer_id = organizer_id;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        organizer: {
          select: { id: true, full_name: true, avatar_url: true, email: true },
        },
        _count: { select: { registrations: true } },
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.event.count({ where }),
  ]);

  return { events, total, page, limit, totalPages: Math.ceil(total / limit) };
}

/**
 * Changer le statut d'un événement (admin peut tout faire)
 */
export async function adminUpdateEventStatus(
  eventId: string,
  status: string
) {
  return prisma.event.update({
    where: { id: eventId },
    data: { status },
  });
}

/**
 * Supprimer un événement (admin)
 */
export async function adminDeleteEvent(eventId: string) {
  return prisma.event.delete({ where: { id: eventId } });
}

/**
 * Liste paginée de tous les utilisateurs (admin)
 */
export async function getAllUsersAdmin(filters: {
  role?: string | undefined;
  search?: string | undefined;
  status?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}) {
  const { role, search, status, page = 1, limit = 20 } = filters;

  const where: Record<string, unknown> = {};
  if (role) where.role = role;
  if (status === "SUSPENDED") where.is_active = false;
  if (status === "ACTIVE") where.is_active = true;
  if (search) {
    where.OR = [
      { full_name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        is_active: true,
        organizer_approved: true,
        avatar_url: true,
        created_at: true,
        _count: {
          select: { events: true, registrations: true },
        },
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
}

/**
 * Suspendre ou réactiver un utilisateur
 */
export async function toggleUserStatus(userId: string, isActive: boolean) {
  return prisma.user.update({
    where: { id: userId },
    data: { is_active: isActive },
  });
}
