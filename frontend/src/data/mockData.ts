import type { Product, Order } from "@/types";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    title: "Pack Découverte Artisanat",
    slug: "pack-decouverte-artisanat",
    price: 25000,
    currency: "Ar",
    images: ["https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=500&q=80"],
    category: "Artisanat",
    categorySlug: "artisanat",
    seller: { id: "vend-1", name: "Mada Création", avatar: "", distance: 2, verified: true },
    stock: 10,
    rating: 4.8,
    reviewCount: 24,
    isNew: true,
    isPopular: false,
    createdAt: "2026-04-01T00:00:00Z",
  },
  {
    id: "prod-2",
    title: "Miel de Baobab Bio",
    slug: "miel-de-baobab-bio",
    price: 12000,
    currency: "Ar",
    images: ["https://images.unsplash.com/photo-1587049352847-8d4c0b4279ab?w=500&q=80"],
    category: "Alimentation",
    categorySlug: "alimentation",
    seller: { id: "vend-2", name: "Saveurs Locales", avatar: "", distance: 5, verified: true },
    stock: 5,
    rating: 4.9,
    reviewCount: 120,
    isNew: false,
    isPopular: true,
    createdAt: "2026-03-15T00:00:00Z",
  },
  {
    id: "prod-3",
    title: "Panier Tressé Traditionnel",
    slug: "panier-tresse-traditionnel",
    price: 35000,
    currency: "Ar",
    images: ["https://images.unsplash.com/photo-1601399839423-ed953c8db4b1?w=500&q=80"],
    category: "Artisanat",
    categorySlug: "artisanat",
    seller: { id: "vend-3", name: "Vannerie du Sud", avatar: "", distance: 8, verified: false },
    stock: 0, // Rupture de stock
    rating: 4.5,
    reviewCount: 8,
    isNew: false,
    isPopular: false,
    createdAt: "2026-01-10T00:00:00Z",
  },
  {
    id: "prod-4",
    title: "Huile Essentielle d'Ylang-Ylang",
    slug: "huile-essentielle-ylang-ylang",
    price: 18000,
    currency: "Ar",
    images: ["https://images.unsplash.com/photo-1608222351212-18fe0ec7b13b?w=500&q=80"],
    category: "Beauté",
    categorySlug: "beaute",
    seller: { id: "vend-4", name: "Essence Nature", avatar: "", distance: 1.5, verified: true },
    stock: 20,
    rating: 4.7,
    reviewCount: 45,
    isNew: true,
    isPopular: true,
    createdAt: "2026-04-10T00:00:00Z",
  },
  {
    id: "prod-5",
    title: "Chocolat Noir 75% Cacao",
    slug: "chocolat-noir-75",
    price: 8500,
    currency: "Ar",
    images: ["https://images.unsplash.com/photo-1614088685112-0a760b71a3c8?w=500&q=80"],
    category: "Alimentation",
    categorySlug: "alimentation",
    seller: { id: "vend-2", name: "Saveurs Locales", avatar: "", distance: 5, verified: true },
    stock: 15,
    rating: 4.6,
    reviewCount: 32,
    isNew: false,
    isPopular: false,
    createdAt: "2026-02-20T00:00:00Z",
  },
  {
    id: "prod-6",
    title: "Savon Artisanal Curcuma",
    slug: "savon-artisanal-curcuma",
    price: 5000,
    currency: "Ar",
    images: ["https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=500&q=80"],
    category: "Beauté",
    categorySlug: "beaute",
    seller: { id: "vend-4", name: "Essence Nature", avatar: "", distance: 1.5, verified: true },
    stock: 8,
    rating: 4.4,
    reviewCount: 15,
    isNew: false,
    isPopular: false,
    createdAt: "2026-03-01T00:00:00Z",
  },
];

export const CATEGORIES = ["Toutes", "Alimentation", "Artisanat", "Beauté"];

export const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-12345",
    createdAt: "2026-04-12T14:32:00Z",
    status: "IN_TRANSIT",
    items: [
      { id: "item-1", product: MOCK_PRODUCTS[0], quantity: 2, priceAtTime: 25000 },
    ],
    totalAmount: 50000,
    currency: "Ar",
    seller: MOCK_PRODUCTS[0].seller,
    shippingAddress: {
      address: "123 Rue Principale",
      city: "Toamasina",
      zipCode: "501"
    },
    deliveryPerson: {
      name: "Marc Dupont",
      avatar: "https://i.pravatar.cc/150?u=marc",
      phone: "034 12 345 67"
    },
    timeline: [
      { status: "PENDING", timestamp: "2026-04-12T14:32:00Z", note: "Commande créée" },
      { status: "CONFIRMED", timestamp: "2026-04-12T15:10:00Z", note: "Mada Création a confirmé la commande" },
      { status: "ASSIGNED", timestamp: "2026-04-12T16:00:00Z", note: "Livreur assigné : Marc Dupont" },
      { status: "IN_TRANSIT", timestamp: "2026-04-12T17:20:00Z", note: "Le livreur est en route" },
    ]
  },
  {
    id: "ORD-12344",
    createdAt: "2026-04-10T09:15:00Z",
    status: "DELIVERED",
    items: [
      { id: "item-2", product: MOCK_PRODUCTS[1], quantity: 1, priceAtTime: 12000 },
      { id: "item-3", product: MOCK_PRODUCTS[4], quantity: 3, priceAtTime: 8500 },
    ],
    totalAmount: 37500,
    currency: "Ar",
    seller: MOCK_PRODUCTS[1].seller,
    shippingAddress: {
      address: "123 Rue Principale",
      city: "Toamasina",
      zipCode: "501"
    },
    timeline: [
      { status: "PENDING", timestamp: "2026-04-10T09:15:00Z" },
      { status: "CONFIRMED", timestamp: "2026-04-10T10:00:00Z" },
      { status: "ASSIGNED", timestamp: "2026-04-10T10:30:00Z" },
      { status: "IN_TRANSIT", timestamp: "2026-04-10T11:45:00Z" },
      { status: "DELIVERED", timestamp: "2026-04-10T12:30:00Z", note: "Livré à la réception" },
    ]
  },
  {
    id: "ORD-12340",
    createdAt: "2026-04-05T18:20:00Z",
    status: "CANCELLED",
    items: [
      { id: "item-4", product: MOCK_PRODUCTS[5], quantity: 1, priceAtTime: 5000 },
    ],
    totalAmount: 5000,
    currency: "Ar",
    seller: MOCK_PRODUCTS[5].seller,
    shippingAddress: {
      address: "123 Rue Principale",
      city: "Toamasina",
      zipCode: "501"
    },
    timeline: [
      { status: "PENDING", timestamp: "2026-04-05T18:20:00Z" },
      { status: "CANCELLED", timestamp: "2026-04-05T19:00:00Z", note: "Annulé par le client (Erreur de commande)" },
    ]
  }
];
