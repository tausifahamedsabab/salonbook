export interface Service {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  durationMinutes?: number;
  imageUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Appointment {
  _id: string;
  customerId: string;
  serviceId: string;
  serviceName?: string;
  service?: Service | null;
  customer?: string | null;
  appointmentDate: string;
  timeSlot?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid' | string;
  requestedAt: string;
}

export interface Payment {
  _id: string;
  appointmentId: string;
  appointment?: { serviceName?: string; appointmentDate?: string } | null;
  service?: string | null;
  serviceId?: string | null;
  appointmentDate?: string | null;
  customerId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'refunded' | 'failed';
  stripeCheckoutSessionId: string;
  createdAt: string;
  updatedAt: string;
}

/** Better Auth user. `role` is an additional field (server-defined). */
export interface AppUser {
  id: string;
  name: string;
  email?: string;
  image?: string | null;
  role?: string;
}
