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
  // Récupérer tous les organisateurs validés
  const organizers = await prisma.user.findMany({
    where: {
      role: "ORGANIZER",
      organizer_approved: true,
      is_active: true
    },
    select: { id: true, full_name: true, email: true },
  });

  if (organizers.length === 0) {
    console.warn("⚠️ Aucun organizer validé trouvé – exécutez d'abord 'npm run seed organizers'");
    return;
  }

  console.log(`📅 Création d'événements avec ${organizers.length} organisateurs...`);

  // Données réelles depuis frontend/src/data/events.ts
  const eventsData = [
    {
      title: "Tech AI Summit Paris 2026",
      category: "conference",
      description: `<p>Rejoignez les <strong>meilleurs experts en intelligence artificielle</strong> pour une journée de conférences, ateliers pratiques et networking au cœur de Paris.</p>
<p>Au programme : LLMs en production, IA générative, éthique de l'IA, et retours d'expérience de startups françaises. Cocktail networking en fin de journée.</p>`,
      cover_image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
      start_date: new Date("2026-06-12T09:00:00Z"),
      end_date: new Date("2026-06-12T18:00:00Z"),
      location: {
        type: "in_person",
        venue: "Station F",
        address: "5 Parvis Alan Turing",
        city: "Paris",
        zipCode: "75013",
        country: "France",
      },
      capacity: 350,
      status: "published",
      tickets: [
        { name: "Early Bird", price: 49, quota: 100, sold: 100, description: "Accès plénière + networking" },
        { name: "Standard", price: 89, quota: 200, sold: 145, description: "Accès plénière + ateliers + networking" },
        { name: "VIP", price: 150, quota: 50, sold: 42, description: "Accès complet + cocktail privé + rencontre speakers" },
      ],
    },
    {
      title: "Jazz sous les Étoiles",
      category: "concert",
      description: `<p>Une soirée magique de jazz en plein air dans les jardins du Parc de la Tête d'Or à Lyon.</p>
<p>Line-up exceptionnel avec <strong>Ibrahim Maalouf</strong>, <strong>Mélody Gardot</strong> et le Lyon Jazz Orchestra. Buvette et food trucks sur place.</p>`,
      cover_image_url: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80",
      start_date: new Date("2026-07-15T20:00:00Z"),
      end_date: new Date("2026-07-16T01:00:00Z"),
      location: {
        type: "in_person",
        venue: "Parc de la Tête d'Or",
        address: "Boulevard des Belges",
        city: "Lyon",
        zipCode: "69006",
        country: "France",
      },
      capacity: 700,
      status: "published",
      tickets: [
        { name: "Pelouse", price: 15, quota: 500, sold: 320, description: "Accès pelouse libre — apportez votre plaid !" },
        { name: "Chaise numérotée", price: 35, quota: 200, sold: 198, description: "Place assise numérotée face à la scène" },
      ],
    },
    {
      title: "Atelier Pâtisserie — Macarons & Éclairs",
      category: "formation",
      description: `<p>Apprenez à réaliser des <strong>macarons parisiens</strong> et des <strong>éclairs au chocolat</strong> avec le chef pâtissier Julien Mercier, Meilleur Ouvrier de France.</p>
<p>Tous les ingrédients et le matériel sont fournis. Repartez avec vos créations !</p>`,
      cover_image_url: "https://images.unsplash.com/photo-1556217477-d325251ece38?w=800&q=80",
      start_date: new Date("2026-05-20T14:00:00Z"),
      end_date: new Date("2026-05-20T17:30:00Z"),
      location: {
        type: "in_person",
        venue: "L'Atelier Sucré",
        address: "12 Rue Sainte-Catherine",
        city: "Bordeaux",
        zipCode: "33000",
        country: "France",
      },
      capacity: 20,
      status: "published",
      tickets: [
        { name: "Participant", price: 85, quota: 20, sold: 18, description: "Atelier complet avec dégustation" },
      ],
    },
    {
      title: "Séminaire Leadership & Management 2026",
      category: "corporate",
      description: `<p>Une journée intensive pour les <strong>managers et dirigeants</strong> souhaitant développer leur leadership dans un contexte de transformation digitale.</p>
<p>Intervenants : consultants McKinsey, DRH de grandes entreprises, coachs certifiés ICF.</p>`,
      cover_image_url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80",
      start_date: new Date("2026-05-06T08:30:00Z"),
      end_date: new Date("2026-05-06T17:30:00Z"),
      location: {
        type: "in_person",
        venue: "Cité des Congrès",
        address: "5 Rue de Valmy",
        city: "Nantes",
        zipCode: "44000",
        country: "France",
      },
      capacity: 90,
      status: "sold_out",
      tickets: [
        { name: "Standard", price: 320, quota: 90, sold: 90, description: "Accès complet + documents + lunch" },
      ],
    },
    {
      title: "Marathon de Bordeaux 2026",
      category: "sport",
      description: `<p>Le <strong>Marathon de Bordeaux</strong> revient pour sa 8ème édition ! Parcourez les quais de la Garonne, le Miroir d'eau et les vignobles en 42, 21 ou 10 km.</p>
<p>Ravitaillements, animations musicales et village coureurs inclus. Médaille finisher pour tous !</p>`,
      cover_image_url: "https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=800&q=80",
      start_date: new Date("2026-09-28T08:00:00Z"),
      end_date: new Date("2026-09-28T16:00:00Z"),
      location: {
        type: "in_person",
        venue: "Place des Quinconces",
        address: "Esplanade des Quinconces",
        city: "Bordeaux",
        zipCode: "33000",
        country: "France",
      },
      capacity: 10000,
      status: "published",
      tickets: [
        { name: "10km", price: 25, quota: 3000, sold: 2100, description: "Parcours 10 km" },
        { name: "Semi-marathon", price: 45, quota: 4000, sold: 3500, description: "Parcours 21 km" },
        { name: "Marathon", price: 65, quota: 3000, sold: 1500, description: "Parcours 42 km" },
      ],
    },
    {
      title: "DevFest Nantes 2026",
      category: "conference",
      description: `<p>Le plus grand événement tech communautaire de l'Ouest ! <strong>+40 talks</strong>, des codelabs, et un espace recrutement.</p>
<p>Thèmes : Cloud, Web, Mobile, DevOps, IA et Cybersécurité. Entrée gratuite, places limitées.</p>`,
      cover_image_url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
      start_date: new Date("2026-06-06T09:00:00Z"),
      end_date: new Date("2026-06-06T18:30:00Z"),
      location: {
        type: "in_person",
        venue: "Cité des Congrès",
        address: "5 Rue de Valmy",
        city: "Nantes",
        zipCode: "44000",
        country: "France",
      },
      capacity: 400,
      status: "published",
      tickets: [
        { name: "Gratuit", price: 0, quota: 400, sold: 385, description: "Entrée gratuite sur inscription" },
      ],
    },
    {
      title: "Nuit Electro Lyon",
      category: "concert",
      description: `<p>Soirée <strong>électro</strong> avec les DJs Worakls, Rone et Petit Biscuit au Transbordeur.</p>
<p>Sound system Funktion-One, mapping vidéo et bar artisanal.</p>`,
      cover_image_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
      start_date: new Date("2026-04-10T22:00:00Z"),
      end_date: new Date("2026-04-11T05:00:00Z"),
      location: {
        type: "in_person",
        venue: "Le Transbordeur",
        address: "3 Boulevard Stalingrad",
        city: "Lyon",
        zipCode: "69100",
        country: "France",
      },
      capacity: 500,
      status: "past",
      tickets: [
        { name: "Standard", price: 35, quota: 500, sold: 500, description: "Entrée soirée" },
      ],
    },
    {
      title: "Yoga en plein air — Parc Borély",
      category: "sport",
      description: `<p>Séance de <strong>yoga Vinyasa</strong> en plein air face à la mer, encadrée par la professeure certifiée Claire Dupuis.</p>
<p>Ouvert à tous niveaux. Apportez votre tapis ou empruntez-en un sur place.</p>`,
      cover_image_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
      start_date: new Date("2026-05-30T08:00:00Z"),
      end_date: new Date("2026-05-30T10:00:00Z"),
      location: {
        type: "in_person",
        venue: "Parc Borély",
        address: "Avenue du Parc Borély",
        city: "Marseille",
        zipCode: "13008",
        country: "France",
      },
      capacity: 30,
      status: "published",
      tickets: [
        { name: "Participant", price: 15, quota: 30, sold: 12, description: "Séance yoga 2h" },
      ],
    },
    {
      title: "Workshop Design Thinking",
      category: "formation",
      description: `<p>Initiez-vous au <strong>Design Thinking</strong> en 3 heures avec des exercices pratiques en groupe.</p>
<p>Workshop interactif via Zoom. Outils Miro fournis, aucun prérequis technique.</p>`,
      cover_image_url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&q=80",
      start_date: new Date("2026-06-02T10:00:00Z"),
      end_date: new Date("2026-06-02T13:00:00Z"),
      location: {
        type: "online",
        onlineUrl: "https://zoom.us/j/fake-link",
      },
      capacity: 100,
      status: "published",
      tickets: [
        { name: "Gratuit", price: 0, quota: 100, sold: 67, description: "Workshop en ligne gratuit" },
      ],
    },
  ];

  // Distribuer les événements entre les organisateurs
  const createdEvents = [];
  for (let i = 0; i < eventsData.length; i++) {
    const eventData = eventsData[i];
    const organizer = organizers[i % organizers.length]; // Cycle through organizers

    if (!eventData || !organizer) continue;

    const eventPayload: EventSeedData = {
      title: eventData.title,
      category: eventData.category,
      description: eventData.description,
      start_date: eventData.start_date,
      end_date: eventData.end_date,
      location: eventData.location,
      capacity: eventData.capacity,
      is_private: false,
      cover_image_url: eventData.cover_image_url,
      status: eventData.status,
      organizer_id: organizer.id,
      tickets: eventData.tickets,
      custom_fields: [],
    };

    // Vérifier si l'événement existe déjà
    const existing = await prisma.event.findFirst({
      where: { title: eventData.title },
    });

    let event;
    if (existing) {
      event = await prisma.event.update({
        where: { id: existing.id },
        data: eventPayload
      });
    } else {
      event = await prisma.event.create({ data: eventPayload });
    }

    createdEvents.push({ ...event, organizer_name: organizer.full_name });
  }

  console.log(`✅ ${createdEvents.length} événements créés/mis à jour :`);
  createdEvents.forEach((ev, i) => {
    console.log(`   ${i + 1}. "${ev.title}" par ${ev.organizer_name}`);
  });
}
