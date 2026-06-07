import { Injectable } from '@nestjs/common';
import {
  SpecBrand,
  SpecModel,
  SpecSearchResult,
  SpecVersion,
  TechnicalSpec,
  VehicleSpecsProvider,
} from '../interfaces/vehicle-specs-provider.interface';
import { slugify } from '../../../common/utils/string.util';

interface ModelSeed {
  name: string;
  years: number[];
  versions: string[];
  spec: TechnicalSpec;
}

/**
 * Offline catalog used for development and as a fallback. Data is illustrative,
 * not an authoritative manufacturer source. Replace with an external provider
 * by implementing VehicleSpecsProvider and wiring it in the module.
 */
const CATALOG: Record<string, ModelSeed[]> = {
  Volkswagen: [
    {
      name: 'Gol',
      years: [2018, 2019, 2020, 2021, 2022],
      versions: ['1.0 MPI', '1.6 MSI Comfortline'],
      spec: {
        engine: '1.0 12v / 1.6 16v',
        power: '84 cv',
        torque: '10,4 kgfm',
        displacement: '999 cc',
        traction: 'Dianteira',
        steering: 'Elétrica',
        suspension: 'McPherson / Eixo de torção',
        urbanConsumption: '12,5 km/l',
        roadConsumption: '14,8 km/l',
        tankCapacity: '55 L',
        trunkCapacity: '285 L',
        length: '3897 mm',
        width: '1656 mm',
        height: '1467 mm',
        wheelbase: '2467 mm',
        weight: '1004 kg',
        airbags: '2 (frontais)',
        brakes: 'Disco / Tambor',
        safetyItems: ['ABS', 'Controle de estabilidade', 'Isofix'],
        comfortItems: [
          'Ar-condicionado',
          'Direção elétrica',
          'Vidros elétricos',
        ],
        multimedia: ['Central multimídia', 'Bluetooth', 'USB'],
        options: ['Rodas de liga leve', 'Sensor de estacionamento'],
        fuel: 'FLEX',
        transmission: 'MANUAL',
        doors: 4,
        seats: 5,
      },
    },
    {
      name: 'T-Cross',
      years: [2020, 2021, 2022, 2023, 2024],
      versions: ['200 TSI Comfortline', '250 TSI Highline'],
      spec: {
        engine: '1.0 TSI / 1.4 TSI',
        power: '128 cv',
        torque: '20,4 kgfm',
        displacement: '999 cc',
        traction: 'Dianteira',
        steering: 'Elétrica',
        urbanConsumption: '11,8 km/l',
        roadConsumption: '13,9 km/l',
        tankCapacity: '52 L',
        trunkCapacity: '373 L',
        airbags: '6',
        brakes: 'Disco nas 4 rodas',
        safetyItems: ['ABS', 'ESC', '6 airbags', 'Alerta de colisão'],
        comfortItems: ['Ar digital', 'Piloto automático', 'Bancos em couro'],
        multimedia: ['VW Play', 'Android Auto', 'Apple CarPlay'],
        options: ['Teto solar', 'Rodas 17"'],
        fuel: 'FLEX',
        transmission: 'AUTOMATIC',
        doors: 4,
        seats: 5,
      },
    },
  ],
  Chevrolet: [
    {
      name: 'Onix',
      years: [2018, 2019, 2020, 2021, 2022, 2023],
      versions: ['1.0 LT', '1.0 Turbo Premier'],
      spec: {
        engine: '1.0 / 1.0 Turbo',
        power: '116 cv',
        torque: '16,8 kgfm',
        displacement: '999 cc',
        traction: 'Dianteira',
        steering: 'Elétrica',
        urbanConsumption: '13,2 km/l',
        roadConsumption: '15,1 km/l',
        tankCapacity: '44 L',
        trunkCapacity: '303 L',
        airbags: '6',
        brakes: 'Disco / Tambor',
        safetyItems: ['ABS', 'ESC', '6 airbags', 'Wi-Fi nativo'],
        comfortItems: [
          'Ar-condicionado',
          'Direção elétrica',
          'Computador de bordo',
        ],
        multimedia: ['MyLink', 'Android Auto', 'Apple CarPlay'],
        options: ['Rodas de liga', 'Câmera de ré'],
        fuel: 'FLEX',
        transmission: 'AUTOMATIC',
        doors: 4,
        seats: 5,
      },
    },
    {
      name: 'Tracker',
      years: [2021, 2022, 2023, 2024],
      versions: ['1.0 Turbo LT', '1.2 Turbo Premier'],
      spec: {
        engine: '1.0 Turbo / 1.2 Turbo',
        power: '133 cv',
        torque: '21,4 kgfm',
        traction: 'Dianteira',
        airbags: '6',
        fuel: 'FLEX',
        transmission: 'AUTOMATIC',
        doors: 4,
        seats: 5,
        safetyItems: ['ABS', 'ESC', '6 airbags'],
        comfortItems: ['Ar digital', 'Piloto automático'],
        multimedia: ['MyLink 8"', 'Android Auto', 'Apple CarPlay'],
      },
    },
  ],
  Fiat: [
    {
      name: 'Argo',
      years: [2018, 2019, 2020, 2021, 2022, 2023],
      versions: ['1.0 Drive', '1.3 Drive', '1.8 HGT'],
      spec: {
        engine: '1.0 / 1.3 / 1.8',
        power: '109 cv',
        torque: '13,7 kgfm',
        traction: 'Dianteira',
        fuel: 'FLEX',
        transmission: 'MANUAL',
        doors: 4,
        seats: 5,
        airbags: '2',
        safetyItems: ['ABS', 'EBD'],
        comfortItems: ['Ar-condicionado', 'Direção elétrica'],
        multimedia: ['Uconnect', 'Bluetooth'],
      },
    },
    {
      name: 'Toro',
      years: [2019, 2020, 2021, 2022, 2023, 2024],
      versions: ['1.8 Freedom', '2.0 Diesel Volcano'],
      spec: {
        engine: '1.8 Flex / 2.0 Turbo Diesel',
        power: '170 cv',
        torque: '35,7 kgfm',
        traction: '4x4',
        fuel: 'DIESEL',
        transmission: 'AUTOMATIC',
        doors: 4,
        seats: 5,
        airbags: '4',
        safetyItems: ['ABS', 'ESC', 'Controle de tração'],
        comfortItems: ['Ar digital', 'Bancos em couro', 'Piloto automático'],
        multimedia: ['Uconnect 7"', 'Android Auto', 'Apple CarPlay'],
      },
    },
  ],
  Toyota: [
    {
      name: 'Corolla',
      years: [2019, 2020, 2021, 2022, 2023, 2024],
      versions: ['2.0 XEI', '1.8 Hybrid Altis'],
      spec: {
        engine: '2.0 Flex / 1.8 Hybrid',
        power: '177 cv',
        torque: '21,4 kgfm',
        traction: 'Dianteira',
        fuel: 'HYBRID',
        transmission: 'CVT',
        doors: 4,
        seats: 5,
        airbags: '7',
        safetyItems: ['ABS', 'ESC', '7 airbags', 'Toyota Safety Sense'],
        comfortItems: [
          'Ar digital dual zone',
          'Piloto adaptativo',
          'Bancos em couro',
        ],
        multimedia: ['Multimídia 9"', 'Android Auto', 'Apple CarPlay'],
      },
    },
    {
      name: 'Hilux',
      years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
      versions: ['2.8 SRV Diesel 4x4', '2.8 SRX Diesel 4x4'],
      spec: {
        engine: '2.8 Turbo Diesel',
        power: '204 cv',
        torque: '50,9 kgfm',
        traction: '4x4',
        fuel: 'DIESEL',
        transmission: 'AUTOMATIC',
        doors: 4,
        seats: 5,
        airbags: '7',
        safetyItems: ['ABS', 'ESC', 'Controle de descida', '7 airbags'],
        comfortItems: ['Ar digital', 'Bancos em couro', 'Piloto automático'],
        multimedia: ['Multimídia 8"', 'Android Auto', 'Apple CarPlay'],
      },
    },
  ],
  Honda: [
    {
      name: 'Civic',
      years: [2017, 2018, 2019, 2020, 2021],
      versions: ['2.0 EXL', '1.5 Turbo Touring'],
      spec: {
        engine: '2.0 / 1.5 Turbo',
        power: '173 cv',
        torque: '22,4 kgfm',
        traction: 'Dianteira',
        fuel: 'GASOLINE',
        transmission: 'CVT',
        doors: 4,
        seats: 5,
        airbags: '6',
        safetyItems: ['ABS', 'ESC', '6 airbags', 'Honda Sensing'],
        comfortItems: ['Ar digital dual zone', 'Bancos em couro'],
        multimedia: ['Multimídia 7"', 'Android Auto', 'Apple CarPlay'],
      },
    },
    {
      name: 'HR-V',
      years: [2019, 2020, 2021, 2022, 2023],
      versions: ['1.8 EXL', '1.5 Turbo Touring'],
      spec: {
        engine: '1.8 / 1.5 Turbo',
        power: '173 cv',
        traction: 'Dianteira',
        fuel: 'FLEX',
        transmission: 'CVT',
        doors: 4,
        seats: 5,
        airbags: '6',
        safetyItems: ['ABS', 'ESC', '6 airbags'],
        comfortItems: ['Ar digital', 'Piloto automático'],
        multimedia: ['Multimídia 8"', 'Android Auto', 'Apple CarPlay'],
      },
    },
  ],
  Hyundai: [
    {
      name: 'HB20',
      years: [2018, 2019, 2020, 2021, 2022, 2023],
      versions: ['1.0 Sense', '1.0 Turbo Platinum'],
      spec: {
        engine: '1.0 / 1.0 Turbo',
        power: '120 cv',
        traction: 'Dianteira',
        fuel: 'FLEX',
        transmission: 'AUTOMATIC',
        doors: 4,
        seats: 5,
        airbags: '6',
        safetyItems: ['ABS', 'ESC', '6 airbags'],
        comfortItems: ['Ar-condicionado', 'Direção elétrica'],
        multimedia: ['Multimídia 8"', 'Android Auto', 'Apple CarPlay'],
      },
    },
    {
      name: 'Creta',
      years: [2020, 2021, 2022, 2023, 2024],
      versions: ['1.0 Turbo Comfort', '2.0 Ultimate'],
      spec: {
        engine: '1.0 Turbo / 2.0',
        power: '167 cv',
        traction: 'Dianteira',
        fuel: 'FLEX',
        transmission: 'AUTOMATIC',
        doors: 4,
        seats: 5,
        airbags: '6',
        safetyItems: ['ABS', 'ESC', '6 airbags'],
        comfortItems: ['Ar digital', 'Piloto automático', 'Bancos em couro'],
        multimedia: ['Multimídia 10,25"', 'Android Auto', 'Apple CarPlay'],
      },
    },
  ],
  Jeep: [
    {
      name: 'Compass',
      years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
      versions: ['2.0 Sport', '1.3 Turbo Limited', '2.0 Diesel 4x4'],
      spec: {
        engine: '2.0 Flex / 1.3 Turbo / 2.0 Diesel',
        power: '185 cv',
        torque: '27,5 kgfm',
        traction: '4x4',
        fuel: 'FLEX',
        transmission: 'AUTOMATIC',
        doors: 4,
        seats: 5,
        airbags: '6',
        safetyItems: ['ABS', 'ESC', '6 airbags', 'Controle de tração'],
        comfortItems: [
          'Ar digital dual zone',
          'Bancos em couro',
          'Teto panorâmico',
        ],
        multimedia: ['Uconnect 10,1"', 'Android Auto', 'Apple CarPlay'],
      },
    },
  ],
  Ford: [
    {
      name: 'Ranger',
      years: [2017, 2018, 2019, 2020, 2021, 2022],
      versions: ['3.2 XLT Diesel 4x4', '2.0 Limited Diesel 4x4'],
      spec: {
        engine: '3.2 / 2.0 Bi-Turbo Diesel',
        power: '213 cv',
        torque: '51,0 kgfm',
        traction: '4x4',
        fuel: 'DIESEL',
        transmission: 'AUTOMATIC',
        doors: 4,
        seats: 5,
        airbags: '6',
        safetyItems: ['ABS', 'ESC', 'Controle de descida'],
        comfortItems: ['Ar digital', 'Bancos em couro'],
        multimedia: ['SYNC 3', 'Android Auto', 'Apple CarPlay'],
      },
    },
  ],
};

@Injectable()
export class MockVehicleSpecsProvider implements VehicleSpecsProvider {
  readonly name = 'mock';

  private brandId(name: string): string {
    return slugify(name);
  }
  private modelId(brand: string, model: string): string {
    return `${slugify(brand)}__${slugify(model)}`;
  }

  async getBrands(): Promise<SpecBrand[]> {
    return Object.keys(CATALOG).map((name) => ({
      id: this.brandId(name),
      name,
    }));
  }

  async getModels(brandId: string): Promise<SpecModel[]> {
    const brandName = Object.keys(CATALOG).find(
      (b) => this.brandId(b) === brandId,
    );
    if (!brandName) return [];
    return CATALOG[brandName].map((m) => ({
      id: this.modelId(brandName, m.name),
      brandId,
      name: m.name,
    }));
  }

  private findModel(modelId: string) {
    for (const [brandName, models] of Object.entries(CATALOG)) {
      const model = models.find(
        (m) => this.modelId(brandName, m.name) === modelId,
      );
      if (model) return { brandName, model };
    }
    return null;
  }

  async getYears(modelId: string): Promise<number[]> {
    const found = this.findModel(modelId);
    return found ? found.model.years : [];
  }

  async getVersions(modelId: string, year?: number): Promise<SpecVersion[]> {
    const found = this.findModel(modelId);
    if (!found) return [];
    const years = year ? [year] : found.model.years;
    const list: SpecVersion[] = [];
    for (const y of years) {
      found.model.versions.forEach((v, idx) =>
        list.push({
          id: `${modelId}__${y}__${idx}`,
          modelId,
          year: y,
          name: v,
        }),
      );
    }
    return list;
  }

  async search(params: {
    brand: string;
    model: string;
    year: number;
    version?: string;
  }): Promise<SpecSearchResult | null> {
    const brandName = Object.keys(CATALOG).find(
      (b) => b.toLowerCase() === params.brand.toLowerCase(),
    );
    if (!brandName) return null;
    const model = CATALOG[brandName].find(
      (m) => m.name.toLowerCase() === params.model.toLowerCase(),
    );
    if (!model) return null;

    return {
      brand: brandName,
      model: model.name,
      year: params.year,
      version: params.version ?? model.versions[0],
      spec: model.spec,
      source: 'PROVIDER_MOCK',
    };
  }
}
