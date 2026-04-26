export interface ApiResponse<T> {
  success: boolean;
  data: T[];
  message: string;
  meta: {
    pagination: {
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
      from: number;
      to: number;
    };
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  productCount: number;
  colorClass: string;
}

export interface SellerSummary {
  id: string;
  name: string;
  avatar: string;
  distance: number;
  verified: boolean;
  address?: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  currency: 'Ar';
  images: string[];
  category: string;
  categorySlug: string;
  seller: SellerSummary;
  stock: number;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isPopular: boolean;
  createdAt: string;
}

export interface Seller {
  id: string;
  name: string;
  slug: string;
  avatar: string;
  coverImage: string;
  category: string;
  categorySlug: string;
  distance: number;
  rating: number;
  reviewCount: number;
  productCount: number;
  verified: boolean;
  openNow: boolean;
  description: string;
  deliveryRadius?: string;
  hours?: Record<string, { open: boolean; start: string; end: string }>;
}

export interface Testimonial {
  id: string;
  name: string;
  role: 'Acheteur' | 'Vendeur';
  city: string;
  avatar: string;
  content: string;
  rating: number;
  date: string;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  priceAtTime: number;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  currency: 'Ar';
  seller: SellerSummary;
  shippingAddress: {
    address: string;
    city: string;
    zipCode: string;
    instructions?: string;
  };
  deliveryPerson?: {
    name: string;
    avatar: string;
    phone: string;
  };
  timeline: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
}
