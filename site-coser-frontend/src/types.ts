export type Role = 'ADMIN' | 'SELLER' | 'CUSTOMER';

export type User = {
  id?: string;
  userId?: string;
  name?: string;
  email: string;
  role: Role;
  employeeId?: string;
  customerId?: string;
};

export type ApiMeta = {
  timestamp?: string;
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  path?: string;
};

export type ApiErrorBody = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiEnvelope<T> =
  | { success: true; data: T; meta?: ApiMeta }
  | { success: false; error: ApiErrorBody; meta?: ApiMeta };

export type PaginatedResult<T> = {
  items: T[];
  meta: ApiMeta;
};

export type VehicleMedia = {
  id?: string;
  url: string;
  isMain?: boolean;
  position?: number;
};

export type Vehicle = {
  id: string;
  publicCode?: string;
  slug?: string;
  brand: string;
  model: string;
  version?: string;
  modelYear?: number;
  manufactureYear?: number;
  category?: string;
  color?: string;
  fuel?: string;
  transmission?: string;
  doors?: number;
  mileage?: number;
  seats?: number;
  condition?: string;
  price?: number;
  featured?: boolean;
  available?: boolean;
  description?: string;
  viewCount?: number;
  favoriteCount?: number;
  status?: string;
  spec?: Record<string, unknown>;
  media?: VehicleMedia[];
};

export type StoreLocation = {
  name: string;
  phone?: string;
  whatsapp?: string;
  address?: {
    street?: string;
    number?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  openingHours?: Record<string, string>;
  googleMapsUrl?: string;
  directionsUrl?: string;
  socialLinks?: Record<string, string>;
};

export type RealtimeMessage<T = unknown> = {
  event: string;
  data: T;
  roles?: Role[];
  sellerId?: string;
  timestamp?: string;
};
