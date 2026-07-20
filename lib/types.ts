export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  is_admin: boolean;
  created_at: string;
};

export type Vehicle = {
  id: string;
  owner_id: string;
  make: string;
  model: string;
  year: number | null;
  plate: string | null;
  created_at: string;
};

export type Service = {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
  active: boolean;
  created_at: string;
};

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export type Booking = {
  id: string;
  customer_id: string;
  vehicle_id: string;
  service_id: string;
  scheduled_at: string;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
  // joined fields (populated by select queries that join related tables)
  vehicles?: Vehicle;
  services?: Service;
  profiles?: Profile;
};

export function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}
