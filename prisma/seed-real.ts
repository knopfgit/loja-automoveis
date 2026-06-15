/* eslint-disable no-console */
/**
 * SEED REAL — Estoque verdadeiro da Coser Premium Cars
 * ----------------------------------------------------
 * Popula o banco com os 19 veículos REAIS do site oficial
 * (coserpremiumcars.com.br), com fotos e ficha técnica reais.
 *
 * As imagens são servidas direto do site da loja (URLs absolutas);
 * o front já repassa URLs http sem alteração.
 *
 * Uso:
 *   npx ts-node prisma/seed-real.ts
 *
 * É idempotente: limpa os veículos existentes (demo/seed) e insere os reais.
 * NÃO mexe em usuários, perfis ou clientes — o login continua funcionando.
 */
import {
  PrismaClient,
  FuelType,
  Transmission,
  VehicleStatus,
  VehicleCondition,
} from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

const code = (p = 'VEI') => `${p}-${randomBytes(3).toString('hex').toUpperCase()}`;

type RealCar = {
  slug: string;
  brand: string; model: string; version: string;
  modelYear: number; manufactureYear: number; price: number;
  fuel: FuelType; transmission: Transmission;
  category: string; color: string; mileage: number | null;
  featured: boolean; description: string;
  spec: {
    engine: string | null; power: string | null; torque: string | null; traction: string | null;
    technicalNotes: string;
    safetyItems: string[]; comfortItems: string[]; multimedia: string[];
  };
  main: string; gallery: string[];
};

const REAL_CARS: RealCar[] = [
  {
    slug: "porsche-macan-gts-full-2-9-biturbo-automatica",
    brand: "Porsche", model: "Macan GTS", version: "Full 2.9 Biturbo",
    modelYear: 2022, manufactureYear: 2022, price: 549900,
    fuel: FuelType.GASOLINE, transmission: Transmission.AUTOMATIC,
    category: "SUV", color: "Azul", mileage: 15000,
    featured: true,
    description: "Versão GTS Full, mais de R$100 mil em opcionais. Único dono, revisões na concessionária Stuttgart. Original, procedência garantida. IPVA 2026 pago, laudo cautelar disponível.",
    spec: {
      engine: "2.9 V6 Biturbo", power: "449 cv", torque: "56,1 kgfm", traction: "Integral AWD",
      technicalNotes: "Motor: 2.9 V6 Biturbo · Potência: 449 cv · Torque: 56,1 kgfm · Câmbio: Automática PDK 7 marchas · Tração: Integral AWD · 0-100 km/h: 4,3 s · Vel. máxima: 272 km/h",
      safetyItems: ["Câmera 360°", "Sensores dianteiros e traseiros", "Head-Up Display", "Matrix LED PDLS Plus"],
      comfortItems: ["Teto solar panorâmico", "Bancos esportivos em couro com memória", "Suspensão pneumática PASM", "Sport Chrono"],
      multimedia: ["Porsche PCM", "Apple CarPlay", "Som Premium BOSE"],
    },
    main: "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_2163-scaled.jpg",
    gallery: [
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_2174-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_2177-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_2165-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_2162-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_2168-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_2167-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_2173-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_2169-scaled.jpg",
    ],
  },
  {
    slug: "porsche-911-carrera-s-cabriolet-3-0-992-1",
    brand: "Porsche", model: "911 Carrera S", version: "Cabriolet 3.0 (992.1)",
    modelYear: 2021, manufactureYear: 2021, price: 938900,
    fuel: FuelType.GASOLINE, transmission: Transmission.AUTOMATIC,
    category: "Cabriolet", color: "GT Silver Metallic", mileage: 14000,
    featured: true,
    description: "Conversível icônico com capota azul, rodas RS Spyder e PPF total. Performance de supercarro. Revisão recente na Stuttgart, histórico completo. Quilometragem baixa.",
    spec: {
      engine: "3.0 Boxer 6cil Biturbo", power: "450 cv", torque: "530 Nm", traction: "Traseira (RWD)",
      technicalNotes: "Motor: 3.0 Boxer 6cil Biturbo · Potência: 450 cv · Torque: 530 Nm · Câmbio: Automática PDK · Tração: Traseira (RWD) · 0-100 km/h: 3,7-3,9 s · Vel. máxima: 306 km/h",
      safetyItems: ["Porsche Entry sem chave"],
      comfortItems: ["Capota conversível", "Pacote SportDesign", "Volante Race-Tex", "Full PPF"],
      multimedia: ["Som BOSE Premium"],
    },
    main: "https://coserpremiumcars.com.br/wp-content/uploads/2026/02/IMG_9608-scaled.jpg",
    gallery: [
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/02/IMG_9668-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/02/IMG_9663-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/02/IMG_9652-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/02/IMG_9647-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/02/IMG_9620-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/02/IMG_9610-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/02/IMG_9599-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/02/IMG_9593-scaled.jpg",
    ],
  },
  {
    slug: "porsche-cayenne-platinum-edition-e-hybrid-v6",
    brand: "Porsche", model: "Cayenne", version: "Platinum Edition E-Hybrid V6",
    modelYear: 2023, manufactureYear: 2022, price: 690900,
    fuel: FuelType.HYBRID, transmission: Transmission.AUTOMATIC,
    category: "SUV", color: "Preto", mileage: null,
    featured: true,
    description: "Pacote Platinum Edition com acabamentos escurecidos, teto solar panorâmico, suspensão a ar ativa. Autonomia elétrica até 44 km.",
    spec: {
      engine: "3.0 V6 Turbo + elétrico 100kW", power: "462 cv (combinada)", torque: "71,3 kgfm", traction: "Integral AWD",
      technicalNotes: "Motor: 3.0 V6 Turbo + elétrico 100kW · Potência: 462 cv (combinada) · Torque: 71,3 kgfm · Câmbio: Tiptronic S 8 marchas · Tração: Integral AWD · 0-100 km/h: 5,0 s · Vel. máxima: 253 km/h",
      safetyItems: ["Câmera 360°", "Sensores dianteiros/traseiros", "Faróis LED Matrix PDLS+"],
      comfortItems: ["Teto solar panorâmico", "Bancos elétricos 18 vias com memória, ventilação e aquecimento", "Suspensão a ar ativa", "Volante aquecido"],
      multimedia: ["PCM 12,3\"", "Apple CarPlay", "Android Auto", "Som BOSE Surround"],
    },
    main: "https://coserpremiumcars.com.br/wp-content/uploads/2025/10/IMG_6915-scaled.jpg",
    gallery: [
      "https://coserpremiumcars.com.br/wp-content/uploads/2025/10/IMG_6987-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2025/10/IMG_6978-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2025/10/IMG_6973-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2025/10/IMG_6964-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2025/10/IMG_6958-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2025/10/IMG_6952-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2025/10/IMG_6949-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2025/10/IMG_6940-scaled.jpg",
    ],
  },
  {
    slug: "bmw-x6-xdrive40i-m-sport",
    brand: "BMW", model: "X6", version: "xDrive40i M Sport",
    modelYear: 2021, manufactureYear: 2020, price: 494900,
    fuel: FuelType.GASOLINE, transmission: Transmission.AUTOMATIC,
    category: "SUV Coupé", color: "Vermelho", mileage: 55000,
    featured: true,
    description: "M Sport com teto panorâmico, rodas aro 21\", Live Cockpit Professional. Pacote Driving Assistant completo.",
    spec: {
      engine: "3.0 TwinPower Turbo 6cil", power: "340 cv", torque: "45,9 kgfm", traction: "Integral xDrive",
      technicalNotes: "Motor: 3.0 TwinPower Turbo 6cil · Potência: 340 cv · Torque: 45,9 kgfm · Câmbio: Automática 8 marchas · Tração: Integral xDrive",
      safetyItems: ["Câmera 360°", "Cruise Control Adaptativo", "Detector ponto cego", "Alerta colisão frontal", "Leitura de placas"],
      comfortItems: ["Teto solar panorâmico", "Ar 4 zonas", "Bancos couro elétricos com memória e aquecimento", "Volante M Sport"],
      multimedia: ["BMW iDrive 7.0 12,3\"", "Painel digital", "Som Hi-Fi Premium"],
    },
    main: "https://coserpremiumcars.com.br/wp-content/uploads/2025/12/IMG_6866-scaled.jpg",
    gallery: [
      "https://coserpremiumcars.com.br/wp-content/uploads/2025/12/IMG_6895-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2025/12/IMG_6892-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2025/12/IMG_6890-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2025/12/IMG_6888-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2025/12/IMG_6886-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2025/12/IMG_6884-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2025/12/IMG_6882-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2025/12/IMG_6880-scaled.jpg",
    ],
  },
  {
    slug: "mercedes-benz-a35-amg-2020",
    brand: "Mercedes-Benz", model: "A35 AMG", version: "2.0 Turbo 4MATIC",
    modelYear: 2020, manufactureYear: 2020, price: 239900,
    fuel: FuelType.GASOLINE, transmission: Transmission.AUTOMATIC,
    category: "Hatch", color: "Branca", mileage: 67000,
    featured: false,
    description: "Abaixo da FIPE. Único, revisões em concessionária, IPVA 2026 pago. 90 dias de garantia pela loja. Hatch AMG 306 cv com 4MATIC.",
    spec: {
      engine: "2.0 Turbo AMG", power: "306 cv", torque: null, traction: "Integral 4MATIC",
      technicalNotes: "Motor: 2.0 Turbo AMG · Potência: 306 cv · Câmbio: AMG Speedshift 7 vel · Tração: Integral 4MATIC · 0-100 km/h: 4,7 s",
      safetyItems: ["Câmera de ré", "Sensores de estacionamento", "Faróis Full LED"],
      comfortItems: ["Suspensão esportiva AMG", "Escape esportivo", "Bancos esportivos elétricos", "Modos Comfort/Sport/Sport+"],
      multimedia: ["Widescreen Cockpit", "Apple CarPlay", "Android Auto", "Som premium"],
    },
    main: "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_4852-scaled.jpg",
    gallery: [
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_4883-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_4882-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_4881-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_4877-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_4876-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_4871-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_4863-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_4862-scaled.jpg",
    ],
  },
  {
    slug: "audi-q8-3-0-tfsi-performance-black-quattro-s-tronic-hibrida",
    brand: "Audi", model: "Q8", version: "3.0 TFSI Performance Black Quattro",
    modelYear: 2019, manufactureYear: 2019, price: 354900,
    fuel: FuelType.HYBRID, transmission: Transmission.AUTOMATIC,
    category: "SUV Coupé", color: "Laranja", mileage: 52905,
    featured: false,
    description: "Rodas aro 22\" Black Edition, teto solar panorâmico, Virtual Cockpit. Som Bang & Olufsen.",
    spec: {
      engine: "3.0 TFSI V6 mild-hybrid", power: null, torque: null, traction: "Quattro AWD",
      technicalNotes: "Motor: 3.0 TFSI V6 mild-hybrid · Câmbio: S-Tronic · Tração: Quattro AWD",
      safetyItems: ["Câmera 360°", "Sensores dianteiros/traseiros", "Faróis Full LED Matrix"],
      comfortItems: ["Teto solar panorâmico", "Ar 4 zonas", "Volante esportivo com paddle shift"],
      multimedia: ["MMI Touch telas duplas", "Apple CarPlay", "Android Auto", "Som Bang & Olufsen"],
    },
    main: "https://coserpremiumcars.com.br/wp-content/uploads/2026/02/IMG_1091-scaled.jpg",
    gallery: [
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/02/IMG_1084-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/02/IMG_1089-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/02/IMG_1090-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/02/IMG_1103-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/02/IMG_1104-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/02/IMG_1105-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/02/IMG_1106-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/02/IMG_1107-scaled.jpg",
    ],
  },
  {
    slug: "mercedes-amg-glc-43-coupe-4matic",
    brand: "Mercedes-Benz", model: "GLC 43 AMG", version: "Coupé 4MATIC",
    modelYear: 2018, manufactureYear: 2018, price: 289900,
    fuel: FuelType.GASOLINE, transmission: Transmission.AUTOMATIC,
    category: "SUV Coupé", color: "Preto", mileage: null,
    featured: false,
    description: "AMG GLC 43 Coupé com motor V6 biturbo e tração 4MATIC. Interior em couro Marrom AMG.",
    spec: {
      engine: "3.0 V6 Biturbo AMG", power: null, torque: null, traction: "Integral 4MATIC",
      technicalNotes: "Motor: 3.0 V6 Biturbo AMG · Tração: Integral 4MATIC",
      safetyItems: [],
      comfortItems: ["Pacote AMG"],
      multimedia: [],
    },
    main: "https://coserpremiumcars.com.br/wp-content/uploads/2026/01/IMG_9323-scaled.jpg",
    gallery: [
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/01/IMG_9344-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/01/IMG_9343-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/01/IMG_9342-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/01/IMG_9341-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/01/IMG_9340-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/01/IMG_9339-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/01/IMG_9338-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/01/IMG_9337-scaled.jpg",
    ],
  },
  {
    slug: "volvo-c40-recharge-plus-single-motor-100-eletrica-automatica",
    brand: "Volvo", model: "C40 Recharge", version: "Plus Single Motor 100% Elétrica",
    modelYear: 2024, manufactureYear: 2024, price: 239900,
    fuel: FuelType.ELECTRIC, transmission: Transmission.AUTOMATIC,
    category: "SUV Coupé", color: "Verde Sage", mileage: null,
    featured: false,
    description: "100% elétrica, rodas aro 19\" diamantadas, teto panorâmico, Google integrado. Som Harman Kardon.",
    spec: {
      engine: "Elétrico Single Motor", power: null, torque: null, traction: "Dianteira",
      technicalNotes: "Motor: Elétrico Single Motor · Câmbio: Automática · Tração: Dianteira",
      safetyItems: [],
      comfortItems: ["Teto solar panorâmico fixo"],
      multimedia: ["Tela vertical 9\" Google integrado", "Som Harman Kardon"],
    },
    main: "https://coserpremiumcars.com.br/wp-content/uploads/2025/10/IMG_2992-1-scaled.jpg",
    gallery: [
      "https://coserpremiumcars.com.br/wp-content/uploads/2025/10/IMG_2994-1-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2025/10/IMG_2996-1-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2025/10/IMG_2998-1-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2025/10/IMG_3001-1-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2025/10/IMG_3003-1-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2025/10/IMG_3005-1-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2025/10/IMG_3007-1-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2025/10/IMG_3009-1-scaled.jpg",
    ],
  },
  {
    slug: "range-rover-evoque-se-si4-r-dynamic-2-0-flex-automatica",
    brand: "Land Rover", model: "Range Rover Evoque", version: "SE Si4 R-Dynamic 2.0 Flex",
    modelYear: 2021, manufactureYear: 2021, price: 245900,
    fuel: FuelType.FLEX, transmission: Transmission.AUTOMATIC,
    category: "SUV", color: "Vermelho", mileage: null,
    featured: false,
    description: "Evoque R-Dynamic SE, motor flex 2.0. Acabamento premium.",
    spec: {
      engine: "2.0 Si4 Flex", power: null, torque: null, traction: "Integral",
      technicalNotes: "Motor: 2.0 Si4 Flex · Câmbio: Automática · Tração: Integral",
      safetyItems: [],
      comfortItems: [],
      multimedia: [],
    },
    main: "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_1622-scaled.jpg",
    gallery: [
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_1645-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_1644-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_1643-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_1642-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_1641-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_1640-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_1639-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_1638-scaled.jpg",
    ],
  },
  {
    slug: "land-rover-velar-hse-r-dynamic-2-0-si4-hibrida-automatica",
    brand: "Land Rover", model: "Velar", version: "HSE R-Dynamic 2.0 Si4 Híbrida",
    modelYear: 2023, manufactureYear: 2023, price: 434900,
    fuel: FuelType.HYBRID, transmission: Transmission.AUTOMATIC,
    category: "SUV", color: "Azul", mileage: 40000,
    featured: false,
    description: "Velar HSE R-Dynamic híbrido, rodas aro 21\" diamantadas, teto panorâmico. Som Meridian.",
    spec: {
      engine: "2.0 Si4 mild-hybrid", power: null, torque: null, traction: "Integral",
      technicalNotes: "Motor: 2.0 Si4 mild-hybrid · Câmbio: Automática · Tração: Integral",
      safetyItems: [],
      comfortItems: ["Teto solar panorâmico", "Ar Dual Zone"],
      multimedia: ["Pivi Pro 11,4\"", "Apple CarPlay/Android Auto sem fio", "Som Meridian"],
    },
    main: "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_2108-scaled.jpg",
    gallery: [
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_2121-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_2120-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_2117-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_2116-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_2115-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_2114-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_2112-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_2111-scaled.jpg",
    ],
  },
  {
    slug: "honda-accord-advance-hybrid-2024",
    brand: "Honda", model: "Accord", version: "Advance Hybrid",
    modelYear: 2024, manufactureYear: 2024, price: 249900,
    fuel: FuelType.HYBRID, transmission: Transmission.AUTOMATIC,
    category: "Sedan", color: "Cinza", mileage: 6000,
    featured: false,
    description: "Apenas 6.000 km, em condição de zero km. Abaixo da FIPE. Pacote Honda Sensing completo.",
    spec: {
      engine: "2.0 i-MMD Híbrido", power: null, torque: null, traction: "Dianteira",
      technicalNotes: "Motor: 2.0 i-MMD Híbrido · Câmbio: e-CVT · Tração: Dianteira",
      safetyItems: ["Honda Sensing (pacote completo de assistentes)"],
      comfortItems: ["Interior premium"],
      multimedia: ["Central multimídia com conectividade"],
    },
    main: "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_5311-scaled.jpg",
    gallery: [
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_5314-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_5318-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_5323-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_5327-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_5329-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_5331-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_5333-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_5336-scaled.jpg",
    ],
  },
  {
    slug: "bmw-320i-m-sport-2021",
    brand: "BMW", model: "320i", version: "M Sport",
    modelYear: 2021, manufactureYear: 2021, price: 212900,
    fuel: FuelType.GASOLINE, transmission: Transmission.AUTOMATIC,
    category: "Sedan", color: "Laranja", mileage: null,
    featured: false,
    description: "320i M Sport, sedan esportivo premium.",
    spec: {
      engine: "2.0 TwinPower Turbo", power: null, torque: null, traction: "Traseira",
      technicalNotes: "Motor: 2.0 TwinPower Turbo · Câmbio: Automática 8 marchas · Tração: Traseira",
      safetyItems: [],
      comfortItems: ["Pacote M Sport"],
      multimedia: [],
    },
    main: "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_6932-scaled.jpg",
    gallery: [
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_6986-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_6982-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_6980-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_6975-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_6972-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_6970-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_6968-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_6966-scaled.jpg",
    ],
  },
  {
    slug: "porsche-macan-2018",
    brand: "Porsche", model: "Macan", version: "2.0 Turbo",
    modelYear: 2018, manufactureYear: 2018, price: 239900,
    fuel: FuelType.GASOLINE, transmission: Transmission.AUTOMATIC,
    category: "SUV", color: "Preto", mileage: null,
    featured: false,
    description: "Macan com interior caramelo. Procedência garantida.",
    spec: {
      engine: "2.0 Turbo", power: null, torque: null, traction: "Integral AWD",
      technicalNotes: "Motor: 2.0 Turbo · Câmbio: PDK · Tração: Integral AWD",
      safetyItems: [],
      comfortItems: [],
      multimedia: [],
    },
    main: "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_6720-scaled.jpg",
    gallery: [
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_6787-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_6785-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_6783-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_6781-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_6779-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_6775-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_6773-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_6771-scaled.jpg",
    ],
  },
  {
    slug: "jeep-compass-s-2022",
    brand: "Jeep", model: "Compass", version: "S 2.0",
    modelYear: 2022, manufactureYear: 2022, price: 146900,
    fuel: FuelType.GASOLINE, transmission: Transmission.AUTOMATIC,
    category: "SUV", color: "Cinza Sting Grey", mileage: null,
    featured: false,
    description: "Compass S, versão topo, cor Sting Grey.",
    spec: {
      engine: "2.0", power: null, torque: null, traction: "Integral",
      technicalNotes: "Motor: 2.0 · Câmbio: Automática · Tração: Integral",
      safetyItems: [],
      comfortItems: [],
      multimedia: [],
    },
    main: "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_6570-scaled.jpg",
    gallery: [
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_6605-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_6618-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_6616-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_6614-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_6612-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_6609-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_6608-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_6603-scaled.jpg",
    ],
  },
  {
    slug: "chevrolet-tracker-premier-2024",
    brand: "Chevrolet", model: "Tracker", version: "Premier 1.2 Turbo",
    modelYear: 2024, manufactureYear: 2024, price: 128900,
    fuel: FuelType.GASOLINE, transmission: Transmission.AUTOMATIC,
    category: "SUV", color: "Branca", mileage: null,
    featured: false,
    description: "Tracker Premier topo de linha, motor 1.2 turbo.",
    spec: {
      engine: "1.2 Turbo", power: "133 cv", torque: null, traction: "Dianteira",
      technicalNotes: "Motor: 1.2 Turbo · Potência: 133 cv · Câmbio: Automática 6 marchas · Tração: Dianteira",
      safetyItems: [],
      comfortItems: [],
      multimedia: [],
    },
    main: "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_8914-scaled.jpg",
    gallery: [
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_8939-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_8940-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_8938-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_8937-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_8936-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_8935-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_8934-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/06/IMG_8930-scaled.jpg",
    ],
  },
  {
    slug: "audi-q5-sportback-performance-black-2-0-tfsie-quattro-hybrid",
    brand: "Audi", model: "Q5 Sportback", version: "Performance Black 2.0 TFSIe Quattro",
    modelYear: 2024, manufactureYear: 2024, price: 386900,
    fuel: FuelType.HYBRID, transmission: Transmission.AUTOMATIC,
    category: "SUV Coupé", color: "Verde Militar", mileage: null,
    featured: false,
    description: "Q5 Sportback Performance Black, híbrido plug-in, cor Verde Militar exclusiva.",
    spec: {
      engine: "2.0 TFSIe plug-in hybrid", power: null, torque: null, traction: "Quattro AWD",
      technicalNotes: "Motor: 2.0 TFSIe plug-in hybrid · Câmbio: S-Tronic · Tração: Quattro AWD",
      safetyItems: [],
      comfortItems: [],
      multimedia: [],
    },
    main: "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_2676-scaled.jpg",
    gallery: [
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_2675-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_2677-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_2678-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_2680-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_2685-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_2690-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_2695-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_2697-scaled.jpg",
    ],
  },
  {
    slug: "chevrolet-tracker-premier-2025",
    brand: "Chevrolet", model: "Tracker", version: "Premier 1.2 Turbo",
    modelYear: 2025, manufactureYear: 2025, price: 136900,
    fuel: FuelType.GASOLINE, transmission: Transmission.AUTOMATIC,
    category: "SUV", color: "Cinza", mileage: null,
    featured: false,
    description: "Tracker Premier 2025, seminovo praticamente zero.",
    spec: {
      engine: "1.2 Turbo", power: "133 cv", torque: null, traction: "Dianteira",
      technicalNotes: "Motor: 1.2 Turbo · Potência: 133 cv · Câmbio: Automática 6 marchas · Tração: Dianteira",
      safetyItems: [],
      comfortItems: [],
      multimedia: [],
    },
    main: "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_6477-scaled.jpg",
    gallery: [
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_6480-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_6485-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_6489-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_6492-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_6497-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_6500-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_6504-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/05/IMG_6509-scaled.jpg",
    ],
  },
  {
    slug: "audi-q5-sportback-performance-2-0-tfsi-e-quattro-s-tronic-hibrida",
    brand: "Audi", model: "Q5 Sportback", version: "Performance 2.0 TFSIe Quattro S-Tronic",
    modelYear: 2026, manufactureYear: 2023, price: 318900,
    fuel: FuelType.HYBRID, transmission: Transmission.AUTOMATIC,
    category: "SUV Coupé", color: "Branco", mileage: null,
    featured: false,
    description: "Q5 Sportback Performance híbrido plug-in, branco com interior cinza.",
    spec: {
      engine: "2.0 TFSIe plug-in hybrid", power: null, torque: null, traction: "Quattro AWD",
      technicalNotes: "Motor: 2.0 TFSIe plug-in hybrid · Câmbio: S-Tronic · Tração: Quattro AWD",
      safetyItems: [],
      comfortItems: [],
      multimedia: [],
    },
    main: "https://coserpremiumcars.com.br/wp-content/uploads/2026/02/IMG_0206-scaled.jpg",
    gallery: [
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/02/IMG_0172-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/02/IMG_0174-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/02/IMG_0175-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/02/IMG_0176-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/02/IMG_0177-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/02/IMG_0180-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/02/IMG_0183-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2026/02/IMG_0200-scaled.jpg",
    ],
  },
  {
    slug: "jaguar-e-pace-r-dynamic-se-p300-300-cv",
    brand: "Jaguar", model: "E-Pace", version: "R-Dynamic SE P300",
    modelYear: 2020, manufactureYear: 2020, price: 217900,
    fuel: FuelType.GASOLINE, transmission: Transmission.AUTOMATIC,
    category: "SUV", color: "Prata", mileage: null,
    featured: false,
    description: "E-Pace R-Dynamic SE com motor P300 de 300 cv e tração integral.",
    spec: {
      engine: "2.0 P300 Turbo", power: "300 cv", torque: null, traction: "Integral AWD",
      technicalNotes: "Motor: 2.0 P300 Turbo · Potência: 300 cv · Câmbio: Automática · Tração: Integral AWD",
      safetyItems: [],
      comfortItems: [],
      multimedia: [],
    },
    main: "https://coserpremiumcars.com.br/wp-content/uploads/2025/11/IMG_6143-scaled.jpg",
    gallery: [
      "https://coserpremiumcars.com.br/wp-content/uploads/2025/11/IMG_6176-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2025/11/IMG_6174-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2025/11/IMG_6172-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2025/11/IMG_6165-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2025/11/IMG_6163-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2025/11/IMG_6161-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2025/11/IMG_6158-scaled.jpg",
      "https://coserpremiumcars.com.br/wp-content/uploads/2025/11/IMG_6155-scaled.jpg",
    ],
  }
];

/** Limpa só o que depende de veículo, na ordem segura de FK. Usuários ficam. */
async function wipeVehicles() {
  await prisma.$transaction([
    prisma.leadInteraction.deleteMany(),
    prisma.lead.deleteMany(),
    prisma.documentVersion.deleteMany(),
    prisma.document.deleteMany(),
    prisma.maintenancePart.deleteMany(),
    prisma.partStockMovement.deleteMany(),
    prisma.maintenance.deleteMany(),
    prisma.commission.deleteMany(),
    prisma.vehicleSale.deleteMany(),
    prisma.vehicleReservation.deleteMany(),
    prisma.vehicleAcquisition.deleteMany(),
    prisma.financialEntry.deleteMany(),
    prisma.vehicleDre.deleteMany(),
    prisma.vehicleStockMovement.deleteMany(),
    prisma.vehicleMedia.deleteMany(),
    prisma.vehicleSpec.deleteMany(),
    prisma.favorite.deleteMany(),
    prisma.vehicleView.deleteMany(),
    prisma.vehicle.deleteMany(),
  ]);
}

async function main() {
  console.log('Limpando veículos antigos (demo/seed)...');
  await wipeVehicles();

  console.log(`Inserindo ${REAL_CARS.length} veículos reais...`);
  for (const c of REAL_CARS) {
    const media = [
      { url: c.main, isMain: true, position: 0, altText: `${c.brand} ${c.model}`, role: 'GALLERY' as const },
      ...c.gallery.map((url, i) => ({
        url, isMain: false, position: i + 1,
        altText: `${c.brand} ${c.model} - foto ${i + 2}`, role: 'GALLERY' as const,
      })),
    ];

    await prisma.vehicle.create({
      data: {
        publicCode: code(),
        slug: c.slug,
        brand: c.brand,
        model: c.model,
        version: c.version,
        modelYear: c.modelYear,
        manufactureYear: c.manufactureYear,
        category: c.category,
        bodyType: c.category,
        color: c.color,
        fuel: c.fuel,
        transmission: c.transmission,
        doors: c.category === 'Cabriolet' ? 2 : 4,
        seats: c.category === 'Cabriolet' ? 4 : 5,
        mileage: c.mileage ?? undefined,
        condition: VehicleCondition.USED,
        status: VehicleStatus.AVAILABLE,
        announcedPrice: c.price,
        suggestedPrice: c.price,
        minPrice: Math.round(c.price * 0.95),
        featured: c.featured,
        availableForAd: true,
        publicDescription: c.description,
        spec: {
          create: {
            engine: c.spec.engine ?? undefined,
            power: c.spec.power ?? undefined,
            torque: c.spec.torque ?? undefined,
            traction: c.spec.traction ?? undefined,
            technicalNotes: c.spec.technicalNotes,
            safetyItems: c.spec.safetyItems,
            comfortItems: c.spec.comfortItems,
            multimedia: c.spec.multimedia,
            source: 'MANUAL',
            lastSyncedAt: new Date(),
          },
        },
        media: { create: media },
      },
    });
    console.log(`  ✓ ${c.brand} ${c.model} ${c.version}`);
  }

  const total = await prisma.vehicle.count();
  console.log(`\n✅ Pronto! ${total} veículos reais no banco, todos AVAILABLE e com fotos reais.`);
  console.log('Abra o catálogo (/catalogo) e dê F5 — o estoque real da Coser aparece.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());