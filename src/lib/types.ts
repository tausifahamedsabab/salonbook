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
  customer?: { _id?: string; name?: string; email?: string } | null;
  appointmentDate: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  requestedAt: string;
}

export interface Payment {
  _id: string;
  appointmentId: string;
  customerId: string;
  appointment?: { serviceName?: string; appointmentDate?: string } | null;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'refunded' | 'failed';
  stripeCheckoutSessionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppUser {
  userId: string;
  name: string;
  email?: string;
  role: 'admin' | 'customer';
}

export interface Session {
  token: string;
  user: AppUser;
}
