import prisma from "../db/client.js";

interface EventSeedData {
  title: string;
  category: string;
  description: string;
  start_date: Date;
  end_date: Date;
  location: any;
  capacity?: number | null;
  is_private?: boolean;
  cover_image_url?: string | null;
  status?: string;
  organizer_id: string;
  tickets: any[];
  custom_fields: any[];
}

export async function seedEvents() {
  const organizer = await prisma.user.findFirst({
    where: { role: "ORGANIZER" },
  });

  if (!organizer) {
    console.warn("⚠️ Aucun organizer trouvé – création d’un organizer de test");
    const newOrg = await prisma.user.create({
      data: {
        full_name: "Organisateur Test",
        email: "organizer@test.com",
        password: "$2b$12$dummyHashForTestOnly",
        role: "ORGANIZER" as never,
        is_active: true,
        onboarding_completed: true,
      } as any,
    });
    console.log(`✅ Organizer test créé : ${newOrg.email}`);
  }

  const defaultOrganizer = organizer?.id || (await prisma.user.findFirst({ where: { role: "ORGANIZER" } }))?.id;

  const sampleEvents: EventSeedData[] = [
    {
      title: "Conférence Tech 2026",
      category: "conference",
      description: "Une conférence sur les dernières tendances tech.",
      start_date: new Date("2026-06-15T09:00:00Z"),
      end_date: new Date("2026-06-15T17:00:00Z"),
      location: { type: "in_person", address: "Antananarivo, Madagascar" },
      capacity: 150,
      status: "published",
      organizer_id: defaultOrganizer!,
      tickets: [
        { name: "Standard", price: 2500, quantity: 100 },
        { name: "VIP", price: 5000, quantity: 50 },
      ],
      custom_fields: [],
    },
    {
      title: "Atelier DevOps",
      category: "formation",
      description: "Formation pratique sur Docker et Kubernetes.",
      start_date: new Date("2026-07-01T08:30:00Z"),
      end_date: new Date("2026-07-01T12:30:00Z"),
      location: { type: "online", onlineUrl: "https://zoom.us/j/123456789" },
      capacity: 30,
      status: "published",
      organizer_id: defaultOrganizer!,
      tickets: [{ name: "Participant", price: 10000, quantity: 30 }],
      custom_fields: [],
    },
  ];

  for (const ev of sampleEvents) {
    const existing = await prisma.event.findFirst({
      where: { title: ev.title },
    });

    if (existing) {
      await prisma.event.update({ where: { id: existing.id }, data: ev });
    } else {
      await prisma.event.create({ data: ev });
    }
  }

  console.log(`✅ ${sampleEvents.length} événements insérés/mis à jour`);
}
