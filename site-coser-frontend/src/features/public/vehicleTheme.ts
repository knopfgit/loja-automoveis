import type { CSSProperties } from 'react';
import type { Vehicle } from '../../types';

export type BrandProfile = {
  name: string;
  slug: string;
  color: string;
  neonA: string;
  neonB: string;
  neonC: string;
  washA: string;
  washB: string;
  washC: string;
};

const profiles: BrandProfile[] = [
  { name: 'BMW', slug: 'bmw', color: '#1266d8', neonA: '#1266d8', neonB: '#67e8f9', neonC: '#6d5dfc', washA: '#d8ecff', washB: '#76b9ff', washC: '#574cff' },
  { name: 'Porsche', slug: 'porsche', color: '#a70f16', neonA: '#a70f16', neonB: '#ff6b75', neonC: '#d7b75b', washA: '#ffe5dc', washB: '#ff8b7a', washC: '#d7b75b' },
  { name: 'Mercedes-Benz', slug: 'mercedesbenz', color: '#6f7885', neonA: '#6f7885', neonB: '#d7dde7', neonC: '#9fe8ff', washA: '#eef4f8', washB: '#aeb8c4', washC: '#d8f5ff' },
  { name: 'Audi', slug: 'audi', color: '#b8141f', neonA: '#b8141f', neonB: '#ff6b75', neonC: '#9ca3af', washA: '#ffe1e3', washB: '#ff7f88', washC: '#ced4dd' },
  { name: 'Ferrari', slug: 'ferrari', color: '#dd1f2d', neonA: '#dd1f2d', neonB: '#ffd43b', neonC: '#22c55e', washA: '#ffdedf', washB: '#ff7b6e', washC: '#ffe777' },
  { name: 'Lamborghini', slug: 'lamborghini', color: '#c89b07', neonA: '#c89b07', neonB: '#fff45f', neonC: '#a3e635', washA: '#fff4bc', washB: '#f3cf54', washC: '#d8ff8d' },
  { name: 'Volkswagen', slug: 'volkswagen', color: '#195a9b', neonA: '#195a9b', neonB: '#8fd3ff', neonC: '#6aa5ff', washA: '#e1f2ff', washB: '#8ec9ff', washC: '#6f8cff' },
  { name: 'Chevrolet', slug: 'chevrolet', color: '#b88308', neonA: '#b88308', neonB: '#ffd36c', neonC: '#f59e0b', washA: '#fff0c9', washB: '#f7c35d', washC: '#ffd58a' },
  { name: 'Toyota', slug: 'toyota', color: '#b51222', neonA: '#b51222', neonB: '#ff7b86', neonC: '#9ca3af', washA: '#ffe4e7', washB: '#ff8790', washC: '#dfe5ee' },
  { name: 'Fiat', slug: 'fiat', color: '#a6252b', neonA: '#a6252b', neonB: '#ff8a8f', neonC: '#8b5cf6', washA: '#ffe2e2', washB: '#ff898d', washC: '#d7c2ff' },
  { name: 'Honda', slug: 'honda', color: '#cc1828', neonA: '#cc1828', neonB: '#ff7b82', neonC: '#c7d2fe', washA: '#ffe0e3', washB: '#ff7c86', washC: '#dde5ff' },
  { name: 'Hyundai', slug: 'hyundai', color: '#0b5fa5', neonA: '#0b5fa5', neonB: '#8cd7ff', neonC: '#5b7cfa', washA: '#dff4ff', washB: '#7dc7ff', washC: '#7b82ff' },
  { name: 'Jeep', slug: 'jeep', color: '#49633e', neonA: '#49633e', neonB: '#b6d99d', neonC: '#e6d0a8', washA: '#edf6df', washB: '#abc891', washC: '#ead8b9' },
  { name: 'Ford', slug: 'ford', color: '#1351a3', neonA: '#1351a3', neonB: '#8fd5ff', neonC: '#5f75f5', washA: '#e0f2ff', washB: '#8ac8ff', washC: '#8590ff' },
];

export const defaultBrandNames = ['BMW', 'Porsche', 'Mercedes-Benz', 'Audi', 'Ferrari', 'Lamborghini'];

const colorTones: Record<string, Pick<BrandProfile, 'color' | 'neonA' | 'neonB' | 'neonC' | 'washA' | 'washB' | 'washC'>> = {
  azul: { color: '#1266d8', neonA: '#1266d8', neonB: '#6ee7ff', neonC: '#6366f1', washA: '#d9f0ff', washB: '#72bbff', washC: '#7c6dff' },
  branco: { color: '#d5dbe5', neonA: '#d5dbe5', neonB: '#ffffff', neonC: '#b8c7d9', washA: '#ffffff', washB: '#e7edf5', washC: '#d6e6f8' },
  prata: { color: '#8e99a8', neonA: '#8e99a8', neonB: '#dde5ef', neonC: '#b8c3d0', washA: '#f1f5f9', washB: '#cbd5e1', washC: '#e3e9f0' },
  cinza: { color: '#6b7280', neonA: '#6b7280', neonB: '#cbd5e1', neonC: '#94a3b8', washA: '#eef1f4', washB: '#b8c1cc', washC: '#d6dde6' },
  preto: { color: '#151923', neonA: '#151923', neonB: '#64748b', neonC: '#a78bfa', washA: '#e6e8ee', washB: '#8b95a5', washC: '#c8b8ff' },
  vermelho: { color: '#c21c2b', neonA: '#c21c2b', neonB: '#ff7a85', neonC: '#ffb86b', washA: '#ffe0e4', washB: '#ff7f89', washC: '#ffc276' },
  amarelo: { color: '#d39c08', neonA: '#d39c08', neonB: '#ffdf68', neonC: '#f97316', washA: '#fff0bd', washB: '#ffd56e', washC: '#ffb56c' },
  verde: { color: '#27784a', neonA: '#27784a', neonB: '#9be7b4', neonC: '#cde85d', washA: '#def8e7', washB: '#94d8ac', washC: '#d9ef86' },
};

function normalize(value?: string) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

export function getBrandProfile(brand?: string): BrandProfile {
  const normalized = normalize(brand);
  const known = profiles.find((profile) => normalize(profile.name) === normalized);
  if (known) return known;

  return {
    name: brand?.trim() || 'Marca',
    slug: normalized || 'simpleicons',
    color: '#1266d8',
    neonA: '#1266d8',
    neonB: '#67e8f9',
    neonC: '#6d5dfc',
    washA: '#e0f2ff',
    washB: '#93c5fd',
    washC: '#c4b5fd',
  };
}

export function logoForBrand(brand?: string) {
  const profile = getBrandProfile(brand);
  return `https://cdn.simpleicons.org/${profile.slug}/${profile.color.replace('#', '')}`;
}

export function brandInitials(brand?: string) {
  const parts = (brand ?? '')
    .trim()
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0] ?? 'M').slice(0, 2).toUpperCase();
}

export function profileForVehicle(vehicle?: Pick<Vehicle, 'brand' | 'color'>): BrandProfile {
  const profile = getBrandProfile(vehicle?.brand);
  const tone = colorTones[normalize(vehicle?.color)] ?? profile;
  return { ...profile, ...tone };
}

export function themeVarsForVehicle(vehicle?: Pick<Vehicle, 'brand' | 'color'>): CSSProperties {
  const profile = profileForVehicle(vehicle);
  return {
    '--vehicle-tone': profile.color,
    '--vehicle-neon-a': profile.neonA,
    '--vehicle-neon-b': profile.neonB,
    '--vehicle-neon-c': profile.neonC,
    '--vehicle-wash-a': profile.washA,
    '--vehicle-wash-b': profile.washB,
    '--vehicle-wash-c': profile.washC,
  } as CSSProperties;
}
