export interface Service {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  duration?: number;
  image?: string;
  status?: 'active' | 'inactive';
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
  message?: string;
  servicePrice?: number;
  stripeCheckoutSessionId?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid' | string;
  requestedAt: string;
}

export interface Payment {
  _id: string;
  appointmentId: string;
  customerId: string;
  service?: string | null;
  serviceId?: string | null;
  appointmentDate?: string | null;
  amount: number;
  currency: string;
  status: 'unpaid' | 'paid' | string;
  stripeSessionId?: string;
  receiptUrl?: string | null;
  transaction?: Transaction | null;
  createdAt: string;
}

export interface Transaction {
  _id: string;
  appointmentId: string;
  customerId: string;
  amount: number;
  currency: string;
  stripeSessionId: string;
  status: 'paid' | 'failed';
  receiptUrl?: string;
  createdAt: string;
}

/** Better Auth user. `role` is an additional field (server-defined). */
export interface AppUser {
  id: string;
  name: string;
  email?: string;
  image?: string | null;
  role?: string;
}
