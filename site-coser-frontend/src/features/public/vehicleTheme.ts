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
  { name: 'Mercedes-Benz', slug: 'mercedes', color: '#6f7885', neonA: '#6f7885', neonB: '#d7dde7', neonC: '#9fe8ff', washA: '#eef4f8', washB: '#aeb8c4', washC: '#d8f5ff' },
  { name: 'Audi', slug: 'audi', color: '#3b424b', neonA: '#3b424b', neonB: '#eef2f6', neonC: '#aab3bf', washA: '#f1f4f7', washB: '#c6cdd6', washC: '#e3e8ee' },
  // Ferrari: paleta do scudetto — vermelho, amarelo Modena, verde e branco da bandeira.
  // O preto do cavallino fica por conta da tinta dos textos/ícones sobre as aquarelas.
  { name: 'Ferrari', slug: 'ferrari', color: '#dd1f2d', neonA: '#dd1f2d', neonB: '#ffd21e', neonC: '#009246', washA: '#fffbea', washB: '#ffe35c', washC: '#9fdfb4' },
  { name: 'Lamborghini', slug: 'lamborghini', color: '#c89b07', neonA: '#c89b07', neonB: '#fff45f', neonC: '#a3e635', washA: '#fff4bc', washB: '#f3cf54', washC: '#d8ff8d' },
  { name: 'Volkswagen', slug: 'volkswagen', color: '#195a9b', neonA: '#195a9b', neonB: '#8fd3ff', neonC: '#6aa5ff', washA: '#e1f2ff', washB: '#8ec9ff', washC: '#6f8cff' },
  { name: 'Chevrolet', slug: 'chevrolet', color: '#b88308', neonA: '#b88308', neonB: '#ffd36c', neonC: '#f59e0b', washA: '#fff0c9', washB: '#f7c35d', washC: '#ffd58a' },
  { name: 'Toyota', slug: 'toyota', color: '#b51222', neonA: '#b51222', neonB: '#ff7b86', neonC: '#9ca3af', washA: '#ffe4e7', washB: '#ff8790', washC: '#dfe5ee' },
  { name: 'Fiat', slug: 'fiat', color: '#a6252b', neonA: '#a6252b', neonB: '#ff8a8f', neonC: '#8b5cf6', washA: '#ffe2e2', washB: '#ff898d', washC: '#d7c2ff' },
  { name: 'Honda', slug: 'honda', color: '#cc1828', neonA: '#cc1828', neonB: '#ff7b82', neonC: '#c7d2fe', washA: '#ffe0e3', washB: '#ff7c86', washC: '#dde5ff' },
  { name: 'Hyundai', slug: 'hyundai', color: '#0b5fa5', neonA: '#0b5fa5', neonB: '#8cd7ff', neonC: '#5b7cfa', washA: '#dff4ff', washB: '#7dc7ff', washC: '#7b82ff' },
  { name: 'Jeep', slug: 'jeep', color: '#49633e', neonA: '#49633e', neonB: '#b6d99d', neonC: '#e6d0a8', washA: '#edf6df', washB: '#abc891', washC: '#ead8b9' },
  { name: 'Ford', slug: 'ford', color: '#1351a3', neonA: '#1351a3', neonB: '#8fd5ff', neonC: '#5f75f5', washA: '#e0f2ff', washB: '#8ac8ff', washC: '#8590ff' },
  { name: 'Tesla', slug: 'tesla', color: '#e82127', neonA: '#e82127', neonB: '#ff8a8f', neonC: '#9ca3af', washA: '#ffe0e2', washB: '#ff8088', washC: '#d7dde6' },
  { name: 'BYD', slug: 'byd', color: '#1a4f9c', neonA: '#1a4f9c', neonB: '#7db4ff', neonC: '#56d0c9', washA: '#e2efff', washB: '#83bcff', washC: '#8fe6df' },
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
  const brand = getBrandProfile(vehicle?.brand);
  return {
    // Cor SEMPRE da marca (nao muda com a pintura do carro) — usada na moldura/identidade.
    '--vehicle-brand': brand.color,
    '--vehicle-tone': profile.color,
    '--vehicle-neon-a': profile.neonA,
    '--vehicle-neon-b': profile.neonB,
    '--vehicle-neon-c': profile.neonC,
    '--vehicle-wash-a': profile.washA,
    '--vehicle-wash-b': profile.washB,
    '--vehicle-wash-c': profile.washC,
  } as CSSProperties;
}

// Tema neutro "branco vidro" usado quando nenhuma marca esta selecionada nem sob o mouse.
export const neutralProfile: BrandProfile = {
  name: 'Estoque',
  slug: 'simpleicons',
  color: '#9fb2c9',
  neonA: '#cdd9e9',
  neonB: '#ffffff',
  neonC: '#dde6f2',
  washA: '#ffffff',
  washB: '#eef3f9',
  washC: '#e3ecf6',
};

function parseHex(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = Number.parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function toHex([r, g, b]: number[]): string {
  return '#' + [r, g, b].map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0')).join('');
}

/** Media dos canais RGB de varias cores, para fundir marcas numa unica paleta. */
export function mixHex(colors: string[]): string {
  if (colors.length === 0) return neutralProfile.color;
  const sum = colors.reduce<[number, number, number]>(
    (acc, color) => {
      const [r, g, b] = parseHex(color);
      return [acc[0] + r, acc[1] + g, acc[2] + b];
    },
    [0, 0, 0],
  );
  return toHex([sum[0] / colors.length, sum[1] / colors.length, sum[2] / colors.length]);
}

/**
 * Combina varias marcas numa unica paleta: a cor base e a media de todas, e as
 * marcas individuais sao preservadas nos acentos (neon/wash) para criar a "juncao"
 * de cores num gradiente de duas (ou mais) tonalidades.
 */
export function combinedBrandProfile(names: string[]): BrandProfile {
  const list = names.map(getBrandProfile);
  if (list.length === 0) return neutralProfile;
  if (list.length === 1) return list[0];
  const second = list[1];
  return {
    name: list.map((profile) => profile.name).join(' + '),
    slug: list[0].slug,
    color: mixHex(list.map((profile) => profile.color)),
    neonA: list[0].color,
    neonB: second.color,
    neonC: mixHex(list.map((profile) => profile.neonC)),
    washA: mixHex(list.map((profile) => profile.washA)),
    washB: list[0].washB,
    washC: second.washB,
  };
}

const GLOBAL_THEME_VARS = ['--brand', '--neon-a', '--neon-b', '--neon-c', '--wash-a', '--wash-b', '--wash-c'] as const;

export function globalThemeVars(profile: BrandProfile): Record<string, string> {
  return {
    '--brand': profile.color,
    '--neon-a': profile.neonA,
    '--neon-b': profile.neonB,
    '--neon-c': profile.neonC,
    '--wash-a': profile.washA,
    '--wash-b': profile.washB,
    '--wash-c': profile.washC,
  };
}

/** Pinta o site inteiro com a paleta da marca (ou combinacao), definindo as vars no <html>. */
export function applyGlobalTheme(profile: BrandProfile): void {
  const root = document.documentElement;
  const vars = globalThemeVars(profile);
  for (const [key, value] of Object.entries(vars)) root.style.setProperty(key, value);
}

/** Remove o tema inline para que as paginas internas voltem ao padrao do :root. */
export function clearGlobalTheme(): void {
  const root = document.documentElement;
  for (const key of GLOBAL_THEME_VARS) root.style.removeProperty(key);
}
