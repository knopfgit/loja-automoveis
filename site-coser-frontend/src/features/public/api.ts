import { api, unwrap, unwrapList } from '../../services/api';
import type { StoreLocation, Vehicle } from '../../types';

export type VehicleFilters = {
  brand?: string;
  model?: string;
  yearMin?: string;
  yearMax?: string;
  priceMin?: string;
  priceMax?: string;
  fuel?: string;
  transmission?: string;
  color?: string;
  category?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
};

export type PublicFilters = {
  brands?: string[];
  brand?: string[];
  models?: string[];
  model?: string[];
  fuels?: string[];
  fuel?: string[];
  transmissions?: string[];
  transmission?: string[];
  colors?: string[];
  categories?: string[];
  years?: number[];
  priceRange?: {
    min: number;
    max: number;
  };
};

export function getFeaturedVehicles() {
  return unwrap<Vehicle[]>(api.get('/public/vehicles/featured'));
}

export function getPublicVehicles(params: VehicleFilters) {
  return unwrapList<Vehicle>(api.get('/public/vehicles', { params }));
}

export function getPublicFilters() {
  return unwrap<PublicFilters>(api.get('/public/filters'));
}

export function getVehicleBySlug(slug: string) {
  return unwrap<Vehicle>(api.get(`/public/vehicles/${slug}`));
}

export function getStoreLocation() {
  return unwrap<StoreLocation>(api.get('/public/store/location'));
}

export function specialistContact(input: { vehicleId: string; name: string; phone: string }) {
  return unwrap<{ leadId: string; whatsappUrl: string; status: string }>(api.post('/public/leads/specialist-contact', input));
}

export function trackVehicleView(vehicleId: string) {
  return api.post('/public/tracking/vehicle-view', { vehicleId }).catch(() => undefined);
}
