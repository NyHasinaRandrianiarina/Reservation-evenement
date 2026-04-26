import { apiRequest } from "./http";

export type DeliveryStatus =
  | "PENDING"
  | "CONFIRMED"
  | "ASSIGNED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED";

export interface DeliveryEvent {
  id: string;
  delivery_id: string;
  status: DeliveryStatus;
  actor_id: string | null;
  note: string | null;
  created_at: string;
}

export interface Delivery {
  id: string;
  tracking_number: string;
  status: DeliveryStatus;
  description: string;
  weight: number | null;
  pickup_address: string;
  delivery_address: string;
  recipient_name: string;
  recipient_phone: string;
  sender_id: string;
  driver_id: string | null;
  created_at: string;
  updated_at: string;
  events?: DeliveryEvent[];
  sender?: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    email?: string;
  };
  driver?: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string | null;
  } | null;
}

export interface Driver {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  zone: string | null;
}

export interface CreateDeliveryInput {
  description: string;
  weight?: number | string;
  pickup_address: string;
  delivery_address: string;
  recipient_name: string;
  recipient_phone: string;
}

export async function createDelivery(input: CreateDeliveryInput) {
  return apiRequest<Delivery, CreateDeliveryInput>({
    method: "POST",
    path: "/deliveries",
    body: input,
  });
}

export async function getAllDeliveries(status?: string) {
  const query = status ? `?status=${status}` : "";
  return apiRequest<Delivery[]>({
    method: "GET",
    path: `/deliveries${query}`,
  });
}

export async function getAvailableDrivers() {
  return apiRequest<Driver[]>({
    method: "GET",
    path: "/deliveries/drivers",
  });
}

export async function assignDriverToDelivery(deliveryId: string, driverId: string) {
  return apiRequest<Delivery, { driver_id: string }>({
    method: "PATCH",
    path: `/deliveries/${deliveryId}/assign`,
    body: { driver_id: driverId },
  });
}
