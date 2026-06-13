import type { Vehicle } from '../../types';

// Carros de demonstracao usados como fallback quando a API publica nao responde
// (ex.: backend NestJS fora do ar). Servem para visualizar o estoque, os filtros
// por marca e a combinacao de cores. Quando o backend real estiver no ar, ele tem
// prioridade e estes dados nao aparecem.

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=82`;

const POOL = {
  porscheGray: img('photo-1503376780353-7e6692767b70'),
  lamboYellow: img('photo-1525609004556-c46c7d6cf023'),
  hyper: img('photo-1544636331-e26879cd4d9b'),
  bmwBlue: img('photo-1555215695-3004980ad54e'),
  bmwM: img('photo-1556189250-72ba954cfc2b'),
  amg: img('photo-1618843479313-40f8afb4b4d8'),
  audi: img('photo-1606664515524-ed2f786a0bd6'),
  ferrari: img('photo-1592198084033-aade902d1aae'),
  porscheBlack: img('photo-1614162692292-7ac56d7f7f1e'),
};

type Seed = Omit<Vehicle, 'media'> & { image: string };

const seeds: Seed[] = [
  {
    id: 'demo-bmw-m4', slug: 'bmw-m4-competition', publicCode: 'BMW-001',
    brand: 'BMW', model: 'M4', version: 'Competition Coupe', price: 720000, color: 'Azul',
    modelYear: 2024, manufactureYear: 2023, mileage: 8200, fuel: 'Gasolina', transmission: 'Automatica 8 marchas',
    category: 'Cupe esportivo', doors: 2, seats: 4, featured: true, available: true,
    description: 'Cupe esportivo com tracao traseira, pacote Competition e acabamento em fibra de carbono.',
    image: POOL.bmwM,
  },
  {
    id: 'demo-bmw-x6', slug: 'bmw-x6-m50i', publicCode: 'BMW-002',
    brand: 'BMW', model: 'X6', version: 'M50i xDrive', price: 690000, color: 'Azul',
    modelYear: 2023, manufactureYear: 2023, mileage: 15400, fuel: 'Gasolina', transmission: 'Automatica 8 marchas',
    category: 'SUV cupe', doors: 4, seats: 5, available: true,
    description: 'SUV cupe V8 biturbo com tracao integral e suspensao adaptativa.',
    image: POOL.bmwBlue,
  },
  {
    id: 'demo-porsche-911', slug: 'porsche-911-turbo-s', publicCode: 'POR-001',
    brand: 'Porsche', model: '911', version: 'Turbo S', price: 1650000, color: 'Preto',
    modelYear: 2024, manufactureYear: 2024, mileage: 3100, fuel: 'Gasolina', transmission: 'PDK 8 marchas',
    category: 'Superesportivo', doors: 2, seats: 4, featured: true, available: true,
    description: 'Icone esportivo com 650 cv, tracao integral e arrancada de 0 a 100 em 2,7 s.',
    image: POOL.porscheBlack,
  },
  {
    id: 'demo-porsche-panamera', slug: 'porsche-panamera-turbo', publicCode: 'POR-002',
    brand: 'Porsche', model: 'Panamera', version: 'Turbo Sport Turismo', price: 920000, color: 'Cinza',
    modelYear: 2024, manufactureYear: 2023, mileage: 4100, fuel: 'Gasolina', transmission: 'PDK 8 marchas',
    category: 'Sport Turismo', doors: 4, seats: 4, available: true,
    description: 'Gran turismo de quatro portas com acabamento esportivo e baixa quilometragem.',
    image: POOL.porscheGray,
  },
  {
    id: 'demo-merc-amg-gt', slug: 'mercedes-amg-gt-63', publicCode: 'MER-001',
    brand: 'Mercedes-Benz', model: 'AMG GT', version: '63 S 4-Door', price: 1180000, color: 'Prata',
    modelYear: 2023, manufactureYear: 2023, mileage: 9800, fuel: 'Gasolina', transmission: 'Automatica 9 marchas',
    category: 'Gran Cupe', doors: 4, seats: 4, featured: true, available: true,
    description: 'Gran cupe AMG V8 biturbo, tracao integral 4MATIC+ e modo Race.',
    image: POOL.amg,
  },
  {
    id: 'demo-merc-gle', slug: 'mercedes-gle-450', publicCode: 'MER-002',
    brand: 'Mercedes-Benz', model: 'GLE', version: '450 4MATIC', price: 640000, color: 'Branco',
    modelYear: 2023, manufactureYear: 2022, mileage: 18700, fuel: 'Hibrido', transmission: 'Automatica 9 marchas',
    category: 'SUV', doors: 4, seats: 5, available: true,
    description: 'SUV de luxo com motorizacao hibrida leve e pacote de assistencia de conducao.',
    // Reuso de foto Mercedes: melhor repetir a marca certa do que exibir outra marca.
    image: POOL.amg,
  },
  {
    id: 'demo-audi-rs7', slug: 'audi-rs7-sportback', publicCode: 'AUD-001',
    brand: 'Audi', model: 'RS7', version: 'Sportback quattro', price: 980000, color: 'Cinza',
    modelYear: 2024, manufactureYear: 2023, mileage: 6400, fuel: 'Gasolina', transmission: 'Tiptronic 8 marchas',
    category: 'Sportback', doors: 4, seats: 5, featured: true, available: true,
    description: 'Sportback de alto desempenho com V8 biturbo e tracao quattro permanente.',
    image: POOL.audi,
  },
  {
    id: 'demo-audi-r8', slug: 'audi-r8-v10', publicCode: 'AUD-002',
    brand: 'Audi', model: 'R8', version: 'V10 Performance', price: 1450000, color: 'Cinza',
    modelYear: 2022, manufactureYear: 2022, mileage: 7200, fuel: 'Gasolina', transmission: 'S tronic 7 marchas',
    category: 'Superesportivo', doors: 2, seats: 2, available: true,
    description: 'Superesportivo V10 aspirado de motor central, um dos ultimos da linhagem.',
    // Reuso de foto Audi: melhor repetir a marca certa do que exibir outra marca.
    image: POOL.audi,
  },
  {
    id: 'demo-ferrari-roma', slug: 'ferrari-roma', publicCode: 'FER-001',
    brand: 'Ferrari', model: 'Roma', version: 'Coupe', price: 3200000, color: 'Vermelho',
    modelYear: 2023, manufactureYear: 2023, mileage: 2400, fuel: 'Gasolina', transmission: 'Dupla embreagem 8 marchas',
    category: 'Gran Turismo', doors: 2, seats: 4, featured: true, available: true,
    description: 'Gran turismo V8 biturbo com design elegante e 620 cv de potencia.',
    image: POOL.ferrari,
  },
  {
    id: 'demo-ferrari-f8', slug: 'ferrari-f8-tributo', publicCode: 'FER-002',
    brand: 'Ferrari', model: 'F8', version: 'Tributo', price: 3850000, color: 'Vermelho',
    modelYear: 2022, manufactureYear: 2021, mileage: 5100, fuel: 'Gasolina', transmission: 'Dupla embreagem 7 marchas',
    category: 'Superesportivo', doors: 2, seats: 2, available: true,
    description: 'Berlinetta de motor central V8 biturbo, homenagem a tradicao esportiva da marca.',
    image: POOL.ferrari,
  },
  {
    id: 'demo-lambo-huracan', slug: 'lamborghini-huracan-evo', publicCode: 'LAM-001',
    brand: 'Lamborghini', model: 'Huracan', version: 'EVO Coupe', price: 3300000, color: 'Amarelo',
    modelYear: 2022, manufactureYear: 2021, mileage: 6200, fuel: 'Gasolina', transmission: 'Automatizado 7 marchas',
    category: 'Superesportivo', doors: 2, seats: 2, featured: true, available: true,
    description: 'V10 aspirado com presenca visual forte, tonalidade aquarela e configuracao esportiva.',
    image: POOL.lamboYellow,
  },
  {
    id: 'demo-lambo-urus', slug: 'lamborghini-urus-s', publicCode: 'LAM-002',
    brand: 'Lamborghini', model: 'Urus', version: 'S', price: 2950000, color: 'Amarelo',
    modelYear: 2024, manufactureYear: 2023, mileage: 3900, fuel: 'Gasolina', transmission: 'Automatica 8 marchas',
    category: 'Super SUV', doors: 4, seats: 5, available: true,
    description: 'Super SUV V8 biturbo com 666 cv, unindo desempenho de superesportivo e uso diario.',
    image: POOL.hyper,
  },
];

export const demoVehicles: Vehicle[] = seeds.map(({ image, ...rest }) => ({
  ...rest,
  media: [{ url: image, isMain: true }],
}));

export const demoBrandNames = [...new Set(demoVehicles.map((vehicle) => vehicle.brand))];

export function findDemoVehicleBySlug(slug: string): Vehicle | undefined {
  return demoVehicles.find((vehicle) => vehicle.slug === slug || vehicle.id === slug);
}
