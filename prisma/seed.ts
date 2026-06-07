/* eslint-disable no-console */
import {
  PrismaClient,
  UserRole,
  VehicleStatus,
  FuelType,
  Transmission,
  VehicleCondition,
  DocumentOwnerType,
  ChecklistStage,
  CommissionRuleType,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

// ---- inline helpers (kept local to avoid src import path issues) ----
const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
const code = (p = 'VEI') =>
  `${p}-${randomBytes(3).toString('hex').toUpperCase()}`;
const hash = (s: string) => bcrypt.hash(s, 10);
const pic = (seed: string) => `https://picsum.photos/seed/${seed}/800/600`;

async function clean() {
  // Order respects FK constraints.
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.emailQueue.deleteMany(),
    prisma.leadInteraction.deleteMany(),
    prisma.lead.deleteMany(),
    prisma.documentVersion.deleteMany(),
    prisma.document.deleteMany(),
    prisma.documentChecklist.deleteMany(),
    prisma.documentType.deleteMany(),
    prisma.maintenancePart.deleteMany(),
    prisma.partStockMovement.deleteMany(),
    prisma.maintenance.deleteMany(),
    prisma.part.deleteMany(),
    prisma.supplier.deleteMany(),
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
    prisma.cookieConsent.deleteMany(),
    prisma.marketingPreference.deleteMany(),
    prisma.privacyRequest.deleteMany(),
    prisma.address.deleteMany(),
    prisma.commissionRule.deleteMany(),
    prisma.employee.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.passwordResetToken.deleteMany(),
    prisma.loginHistory.deleteMany(),
    prisma.rolePermission.deleteMany(),
    prisma.permission.deleteMany(),
    prisma.role.deleteMany(),
    prisma.user.deleteMany(),
    prisma.store.deleteMany(),
  ]);
}

async function computeDre(vehicleId: string) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) return;
  const entries = await prisma.financialEntry.findMany({
    where: { vehicleId, status: 'CONFIRMED' },
  });
  let revenue = 0;
  let expenses = 0;
  const breakdown: Record<string, number> = {};
  for (const e of entries) {
    const amt = Number(e.amount);
    if (e.nature === 'REVENUE') revenue += amt;
    else if (e.category !== 'Comissão') {
      expenses += amt;
      breakdown[e.category] = (breakdown[e.category] || 0) + amt;
    }
  }
  const commAgg = await prisma.commission.aggregate({
    where: { vehicleId, status: { not: 'CANCELED' } },
    _sum: { amount: true },
  });
  const commission = Number(commAgg._sum.amount || 0);
  if (commission) breakdown['Comissão'] = commission;
  const gross = revenue - expenses;
  const net = gross - commission;
  const start = vehicle.entryDate;
  const end = vehicle.soldAt ?? new Date();
  const days = Math.max(
    0,
    Math.floor((end.getTime() - start.getTime()) / 86400000),
  );
  await prisma.vehicleDre.upsert({
    where: { vehicleId },
    create: {
      vehicleId,
      totalInvested: expenses,
      totalExpenses: expenses,
      totalRevenue: revenue,
      grossProfit: gross,
      commissionTotal: commission,
      netProfit: net,
      profitMargin: revenue > 0 ? (net / revenue) * 100 : 0,
      daysInStock: days,
      costPerDay: expenses / Math.max(1, days),
      categoryBreakdown: breakdown,
    },
    update: {
      totalInvested: expenses,
      totalExpenses: expenses,
      totalRevenue: revenue,
      grossProfit: gross,
      commissionTotal: commission,
      netProfit: net,
      profitMargin: revenue > 0 ? (net / revenue) * 100 : 0,
      daysInStock: days,
      costPerDay: expenses / Math.max(1, days),
      categoryBreakdown: breakdown,
    },
  });
}

async function main() {
  console.log('🌱 Limpando base...');
  await clean();

  // ---- Store ----
  console.log('🏪 Loja...');
  await prisma.store.create({
    data: {
      name: 'Auto Dealer Caxias',
      cnpj: '12345678000199',
      phone: '5430001000',
      whatsapp: '5454999990000',
      email: 'contato@autodealer.local',
      street: 'Av. Júlio de Castilhos',
      number: '1000',
      district: 'Centro',
      zipCode: '95010000',
      city: 'Caxias do Sul',
      state: 'RS',
      latitude: -29.1685,
      longitude: -51.1796,
      openingHours: {
        seg_sex: '08:00-18:00',
        sab: '08:00-12:00',
        dom: 'fechado',
      },
      socialLinks: {
        instagram: 'https://instagram.com/autodealer',
        facebook: 'https://facebook.com/autodealer',
      },
    },
  });

  // ---- RBAC roles ----
  const roles = await Promise.all(
    ['ADMIN', 'SELLER', 'CUSTOMER'].map((name) =>
      prisma.role.create({ data: { name, isSystem: true } }),
    ),
  );

  // ---- Commission rules ----
  console.log('💰 Regras de comissão...');
  const ruleSale = await prisma.commissionRule.create({
    data: {
      name: 'Padrão 3% sobre venda',
      type: CommissionRuleType.PERCENT_SALE,
      percentage: 3,
      isDefault: true,
      description: 'Regra padrão da loja',
    },
  });
  await prisma.commissionRule.create({
    data: {
      name: '20% sobre lucro',
      type: CommissionRuleType.PERCENT_PROFIT,
      percentage: 20,
    },
  });
  await prisma.commissionRule.create({
    data: {
      name: 'Progressiva por faixa',
      type: CommissionRuleType.PROGRESSIVE,
      tiers: [
        { min: 0, max: 80000, percentage: 2 },
        { min: 80000.01, max: 150000, percentage: 3 },
        { min: 150000.01, max: null, percentage: 4 },
      ],
    },
  });

  // ---- Users ----
  console.log('👤 Usuários...');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@autodealer.local',
      passwordHash: await hash('Admin@123'),
      role: UserRole.ADMIN,
      roleProfileId: roles.find((r) => r.name === 'ADMIN')!.id,
      employee: {
        create: {
          fullName: 'Administrador Master',
          cpf: '11144477735',
          email: 'admin@autodealer.local',
          phone: '5430001000',
          whatsapp: '5454999990001',
          position: 'Administrador',
          admissionDate: new Date('2023-01-02'),
        },
      },
    },
    include: { employee: true },
  });

  const seller1User = await prisma.user.create({
    data: {
      email: 'carlos@autodealer.local',
      passwordHash: await hash('Seller@123'),
      role: UserRole.SELLER,
      employee: {
        create: {
          fullName: 'Carlos Vendedor',
          cpf: '39053344705',
          email: 'carlos@autodealer.local',
          phone: '5454999990002',
          whatsapp: '5454999990002',
          position: 'Vendedor',
          admissionDate: new Date('2023-03-10'),
          pixKey: 'carlos@autodealer.local',
          defaultCommissionRuleId: ruleSale.id,
        },
      },
    },
    include: { employee: true },
  });

  const seller2User = await prisma.user.create({
    data: {
      email: 'ana@autodealer.local',
      passwordHash: await hash('Seller@123'),
      role: UserRole.SELLER,
      employee: {
        create: {
          fullName: 'Ana Vendedora',
          cpf: '52998224725',
          email: 'ana@autodealer.local',
          phone: '5454999990003',
          whatsapp: '5454999990003',
          position: 'Vendedora',
          admissionDate: new Date('2023-06-01'),
          defaultCommissionRuleId: ruleSale.id,
        },
      },
    },
    include: { employee: true },
  });

  const seller1 = seller1User.employee!;
  const seller2 = seller2User.employee!;

  // ---- Customers ----
  console.log('🧑 Clientes...');
  const cust1 = await prisma.user.create({
    data: {
      email: 'maria@cliente.com',
      passwordHash: await hash('Customer@123'),
      role: UserRole.CUSTOMER,
      customer: {
        create: {
          fullName: 'Maria Souza',
          document: '15350946056',
          personType: 'INDIVIDUAL',
          email: 'maria@cliente.com',
          phone: '5454988887777',
          whatsapp: '5454988887777',
          marketingConsent: true,
          cookieConsent: true,
          addresses: {
            create: {
              zipCode: '95020000',
              street: 'Rua Sinimbu',
              number: '123',
              district: 'Centro',
              city: 'Caxias do Sul',
              state: 'RS',
            },
          },
          marketingPreference: {
            create: {
              emailOptIn: true,
              interestBrands: ['Volkswagen', 'Toyota'],
              priceMax: 120000,
            },
          },
        },
      },
    },
    include: { customer: true },
  });

  const cust2 = await prisma.user.create({
    data: {
      email: 'joao@cliente.com',
      passwordHash: await hash('Customer@123'),
      role: UserRole.CUSTOMER,
      customer: {
        create: {
          fullName: 'João Pereira',
          document: '11144477735'.replace('11144477735', '20530271007'),
          personType: 'INDIVIDUAL',
          email: 'joao@cliente.com',
          phone: '5454977776666',
          marketingConsent: false,
          cookieConsent: true,
        },
      },
    },
    include: { customer: true },
  });

  const cust3 = await prisma.customer.create({
    data: {
      fullName: 'Construtora Delta LTDA',
      document: '19131243000197',
      personType: 'COMPANY',
      email: 'compras@delta.com',
      phone: '5430002000',
      marketingConsent: true,
    },
  });

  // ---- Suppliers ----
  console.log('🏭 Fornecedores...');
  const sup1 = await prisma.supplier.create({
    data: { name: 'AutoPeças Serra', document: '11222333000181', phone: '5430003000' },
  });
  const sup2 = await prisma.supplier.create({
    data: { name: 'Distribuidora Sul', document: '44555666000172' },
  });

  // ---- Parts ----
  console.log('🔧 Peças...');
  const partsData = [
    { internalCode: 'PC-0001', name: 'Filtro de óleo', category: 'Filtros', quantity: 25, minQuantity: 5, costPrice: 35, supplierId: sup1.id },
    { internalCode: 'PC-0002', name: 'Pastilha de freio', category: 'Freios', quantity: 12, minQuantity: 4, costPrice: 120, supplierId: sup1.id },
    { internalCode: 'PC-0003', name: 'Óleo 5W30 (litro)', category: 'Lubrificantes', quantity: 40, minQuantity: 10, costPrice: 45, supplierId: sup2.id },
    { internalCode: 'PC-0004', name: 'Filtro de ar', category: 'Filtros', quantity: 3, minQuantity: 5, costPrice: 60, supplierId: sup2.id },
    { internalCode: 'PC-0005', name: 'Vela de ignição', category: 'Motor', quantity: 30, minQuantity: 8, costPrice: 28, supplierId: sup1.id },
    { internalCode: 'PC-0006', name: 'Correia dentada', category: 'Motor', quantity: 6, minQuantity: 3, costPrice: 180, supplierId: sup2.id },
  ];
  const parts: any[] = [];
  for (const p of partsData) {
    const part = await prisma.part.create({
      data: { ...p, averagePrice: p.costPrice, unit: 'UN' },
    });
    await prisma.partStockMovement.create({
      data: {
        partId: part.id,
        type: 'ENTRY',
        quantity: p.quantity,
        unitCost: p.costPrice,
        totalCost: p.costPrice * p.quantity,
        reason: 'initial_stock',
        performedById: admin.id,
      },
    });
    parts.push(part);
  }

  // ---- Document types + checklists ----
  console.log('📄 Tipos de documento e checklists...');
  const vehicleDocs = [
    ['CRLV', 'CRLV-e', true],
    ['ATPV', 'ATPV-e', false],
    ['LAUDO', 'Laudo cautelar', true],
    ['VISTORIA', 'Vistoria', true],
    ['NF_COMPRA', 'Nota fiscal de compra', false],
    ['CONTRATO_VENDA', 'Contrato de venda', false],
  ] as const;
  const personDocs = [
    ['RG', 'RG', false],
    ['CPF', 'CPF', false],
    ['CNH', 'CNH', true],
    ['COMP_RES', 'Comprovante de residência', false],
    ['COMP_PAG', 'Comprovante de pagamento', false],
  ] as const;

  const docTypes: Record<string, string> = {};
  for (const [c, name, hasExpiry] of vehicleDocs) {
    const t = await prisma.documentType.create({
      data: { code: c, name, ownerType: DocumentOwnerType.VEHICLE, hasExpiry },
    });
    docTypes[c] = t.id;
  }
  for (const [c, name, hasExpiry] of personDocs) {
    const t = await prisma.documentType.create({
      data: { code: c, name, ownerType: DocumentOwnerType.BUYER, hasExpiry },
    });
    docTypes[c] = t.id;
  }

  // Checklists per stage
  await prisma.documentChecklist.createMany({
    data: [
      { stage: ChecklistStage.PURCHASE, documentTypeId: docTypes['NF_COMPRA'], position: 1 },
      { stage: ChecklistStage.PURCHASE, documentTypeId: docTypes['LAUDO'], position: 2 },
      { stage: ChecklistStage.STOCK_ENTRY, documentTypeId: docTypes['CRLV'], position: 1 },
      { stage: ChecklistStage.STOCK_ENTRY, documentTypeId: docTypes['VISTORIA'], position: 2 },
      { stage: ChecklistStage.SALE, documentTypeId: docTypes['CONTRATO_VENDA'], position: 1 },
      { stage: ChecklistStage.SALE, documentTypeId: docTypes['RG'], position: 2 },
      { stage: ChecklistStage.SALE, documentTypeId: docTypes['CPF'], position: 3 },
      { stage: ChecklistStage.SALE, documentTypeId: docTypes['COMP_RES'], position: 4 },
      { stage: ChecklistStage.TRANSFER, documentTypeId: docTypes['ATPV'], position: 1 },
    ],
  });

  // ---- Vehicles ----
  console.log('🚗 Veículos...');
  const vehiclesSeed = [
    { brand: 'Volkswagen', model: 'T-Cross', version: '200 TSI Comfortline', my: 2023, mileage: 32000, purchase: 95000, announced: 119900, status: VehicleStatus.AVAILABLE, fuel: FuelType.FLEX, transmission: Transmission.AUTOMATIC, color: 'Prata', category: 'SUV', featured: true },
    { brand: 'Chevrolet', model: 'Onix', version: '1.0 Turbo Premier', my: 2022, mileage: 41000, purchase: 68000, announced: 84900, status: VehicleStatus.AVAILABLE, fuel: FuelType.FLEX, transmission: Transmission.AUTOMATIC, color: 'Branco', category: 'Hatch', featured: true },
    { brand: 'Toyota', model: 'Corolla', version: '2.0 XEI', my: 2021, mileage: 55000, purchase: 105000, announced: 129900, status: VehicleStatus.AVAILABLE, fuel: FuelType.FLEX, transmission: Transmission.CVT, color: 'Preto', category: 'Sedan' },
    { brand: 'Fiat', model: 'Toro', version: '2.0 Diesel Volcano', my: 2022, mileage: 38000, purchase: 130000, announced: 159900, status: VehicleStatus.AVAILABLE, fuel: FuelType.DIESEL, transmission: Transmission.AUTOMATIC, color: 'Cinza', category: 'Picape', featured: true },
    { brand: 'Honda', model: 'HR-V', version: '1.8 EXL', my: 2020, mileage: 62000, purchase: 92000, announced: 112900, status: VehicleStatus.AVAILABLE, fuel: FuelType.FLEX, transmission: Transmission.CVT, color: 'Vermelho', category: 'SUV' },
    { brand: 'Hyundai', model: 'Creta', version: '1.0 Turbo Comfort', my: 2023, mileage: 21000, purchase: 98000, announced: 124900, status: VehicleStatus.RESERVED, fuel: FuelType.FLEX, transmission: Transmission.AUTOMATIC, color: 'Azul', category: 'SUV' },
    { brand: 'Jeep', model: 'Compass', version: '1.3 Turbo Limited', my: 2022, mileage: 45000, purchase: 125000, announced: 154900, status: VehicleStatus.IN_MAINTENANCE, fuel: FuelType.FLEX, transmission: Transmission.AUTOMATIC, color: 'Branco', category: 'SUV' },
    { brand: 'Ford', model: 'Ranger', version: '3.2 XLT Diesel 4x4', my: 2021, mileage: 70000, purchase: 145000, announced: 179900, status: VehicleStatus.SOLD, fuel: FuelType.DIESEL, transmission: Transmission.AUTOMATIC, color: 'Prata', category: 'Picape' },
    { brand: 'Volkswagen', model: 'Gol', version: '1.6 MSI Comfortline', my: 2020, mileage: 58000, purchase: 48000, announced: 59900, status: VehicleStatus.SOLD, fuel: FuelType.FLEX, transmission: Transmission.MANUAL, color: 'Branco', category: 'Hatch' },
    { brand: 'Chevrolet', model: 'Tracker', version: '1.2 Turbo Premier', my: 2023, mileage: 18000, purchase: 108000, announced: 134900, status: VehicleStatus.AVAILABLE, fuel: FuelType.FLEX, transmission: Transmission.AUTOMATIC, color: 'Cinza', category: 'SUV', featured: true },
    { brand: 'Hyundai', model: 'HB20', version: '1.0 Sense', my: 2021, mileage: 49000, purchase: 52000, announced: 66900, status: VehicleStatus.DRAFT, fuel: FuelType.FLEX, transmission: Transmission.MANUAL, color: 'Prata', category: 'Hatch' },
  ];

  const vehicles: any[] = [];
  for (let i = 0; i < vehiclesSeed.length; i++) {
    const v = vehiclesSeed[i];
    const slug = slugify(`${v.brand}-${v.model}-${v.version}-${v.my}-${i}`);
    const created = await prisma.vehicle.create({
      data: {
        publicCode: code(),
        slug,
        brand: v.brand,
        model: v.model,
        version: v.version,
        manufactureYear: v.my - 1,
        modelYear: v.my,
        plate: `ABC${1000 + i}`,
        renavam: `0012345${1000 + i}`,
        chassis: `9BWZZZ377VT00${4000 + i}`,
        color: v.color,
        category: v.category,
        bodyType: v.category,
        fuel: v.fuel,
        transmission: v.transmission,
        doors: 4,
        seats: 5,
        mileage: v.mileage,
        condition: VehicleCondition.USED,
        purchasePrice: v.purchase,
        suggestedPrice: v.announced,
        announcedPrice: v.announced,
        minPrice: Math.round(v.announced * 0.92),
        featured: v.featured ?? false,
        availableForAd: v.status !== VehicleStatus.DRAFT,
        status: v.status,
        publicDescription: `${v.brand} ${v.model} ${v.version} ${v.my}, revisado e em ótimo estado.`,
        entryDate: new Date(Date.now() - (30 + i * 7) * 86400000),
        createdById: admin.id,
        viewCount: Math.floor(Math.random() * 400),
        favoriteCount: Math.floor(Math.random() * 30),
        spec: {
          create: {
            engine: '1.0/2.0',
            power: '120 cv',
            traction: 'Dianteira',
            safetyItems: ['ABS', 'ESC', 'Airbags'],
            comfortItems: ['Ar-condicionado', 'Direção elétrica'],
            multimedia: ['Central multimídia', 'Android Auto', 'Apple CarPlay'],
            source: 'PROVIDER_MOCK',
            lastSyncedAt: new Date(),
          },
        },
        media: {
          create: [
            { url: pic(`${slug}-1`), isMain: true, position: 0, altText: `${v.brand} ${v.model} frente` },
            { url: pic(`${slug}-2`), position: 1, altText: `${v.brand} ${v.model} lateral` },
          ],
        },
      },
    });

    // Acquisition + purchase expense
    await prisma.vehicleAcquisition.create({
      data: {
        vehicleId: created.id,
        type: 'OWN_PURCHASE',
        sellerName: 'Particular',
        purchasePrice: v.purchase,
        purchaseDate: created.entryDate,
        status: 'CONFIRMED',
        responsibleId: admin.id,
      },
    });
    await prisma.financialEntry.create({
      data: {
        vehicleId: created.id,
        nature: 'EXPENSE',
        category: 'Compra do veículo',
        amount: v.purchase,
        description: 'Compra do veículo',
        origin: 'AUTOMATIC',
        sourceModule: 'acquisition',
        date: created.entryDate,
      },
    });
    // Some prep cost
    await prisma.financialEntry.create({
      data: {
        vehicleId: created.id,
        nature: 'EXPENSE',
        category: 'Lavagem',
        amount: 150 + i * 10,
        description: 'Preparação / estética',
        origin: 'AUTOMATIC',
        sourceModule: 'manual',
        date: created.entryDate,
      },
    });

    vehicles.push({ ...created, _seed: v });
  }

  // ---- Maintenance (in-maintenance vehicle) ----
  console.log('🛠️  Manutenções...');
  const maintVehicle = vehicles.find((v) => v._seed.status === VehicleStatus.IN_MAINTENANCE)!;
  const maint = await prisma.maintenance.create({
    data: {
      vehicleId: maintVehicle.id,
      type: 'REVISION',
      description: 'Revisão completa pré-venda',
      workshop: 'Oficina Central',
      supplierId: sup1.id,
      mileage: maintVehicle._seed.mileage,
      laborCost: 400,
      status: 'IN_PROGRESS',
      responsibleId: admin.id,
    },
  });
  // Apply a part to the maintenance
  const usedPart = parts[1]; // pastilha de freio
  await prisma.part.update({
    where: { id: usedPart.id },
    data: { quantity: { decrement: 2 } },
  });
  const mp = await prisma.maintenancePart.create({
    data: {
      maintenanceId: maint.id,
      partId: usedPart.id,
      quantity: 2,
      unitCost: Number(usedPart.costPrice),
      totalCost: Number(usedPart.costPrice) * 2,
    },
  });
  await prisma.partStockMovement.create({
    data: {
      partId: usedPart.id,
      type: 'APPLY_TO_VEHICLE',
      quantity: 2,
      unitCost: Number(usedPart.costPrice),
      totalCost: Number(usedPart.costPrice) * 2,
      vehicleId: maintVehicle.id,
      maintenanceId: maint.id,
    },
  });
  await prisma.financialEntry.create({
    data: {
      vehicleId: maintVehicle.id,
      nature: 'EXPENSE',
      category: 'Peças',
      amount: Number(usedPart.costPrice) * 2,
      description: 'Peça aplicada na manutenção',
      origin: 'AUTOMATIC',
      sourceModule: 'parts',
      externalRef: mp.id,
    },
  });
  await prisma.maintenance.update({
    where: { id: maint.id },
    data: { partsCost: Number(usedPart.costPrice) * 2, totalCost: 400 + Number(usedPart.costPrice) * 2 },
  });

  // ---- Reservation ----
  console.log('📌 Reservas...');
  const reservedVehicle = vehicles.find((v) => v._seed.status === VehicleStatus.RESERVED)!;
  await prisma.vehicleReservation.create({
    data: {
      vehicleId: reservedVehicle.id,
      customerId: cust1.customer!.id,
      sellerId: seller1.id,
      expiresAt: new Date(Date.now() + 2 * 86400000),
      depositAmount: 2000,
      paymentMethod: 'PIX',
      status: 'ACTIVE',
    },
  });

  // ---- Sales (completed) + commissions ----
  console.log('🤝 Vendas e comissões...');
  const soldVehicles = vehicles.filter((v) => v._seed.status === VehicleStatus.SOLD);
  const buyers = [cust1.customer!, cust2.customer!];
  const sellers = [seller1, seller2];
  for (let i = 0; i < soldVehicles.length; i++) {
    const sv = soldVehicles[i];
    const seller = sellers[i % sellers.length];
    const buyer = buyers[i % buyers.length];
    const finalPrice = Math.round(sv._seed.announced * 0.97);
    const soldAt = new Date(Date.now() - (5 + i * 3) * 86400000);

    await prisma.vehicle.update({
      where: { id: sv.id },
      data: { soldPrice: finalPrice, soldAt },
    });

    const sale = await prisma.vehicleSale.create({
      data: {
        vehicleId: sv.id,
        customerId: buyer.id,
        sellerId: seller.id,
        saleDate: soldAt,
        announcedPrice: sv._seed.announced,
        negotiatedPrice: finalPrice,
        discount: sv._seed.announced - finalPrice,
        finalPrice,
        paymentMethod: 'FINANCING',
        financing: true,
        financialInstitution: 'Banco XPTO',
        status: 'COMPLETED',
      },
    });

    await prisma.financialEntry.create({
      data: {
        vehicleId: sv.id,
        nature: 'REVENUE',
        category: 'Venda do veículo',
        amount: finalPrice,
        description: 'Venda do veículo',
        origin: 'AUTOMATIC',
        sourceModule: 'sale',
        externalRef: sale.id,
        date: soldAt,
      },
    });

    const commissionAmount = Math.round(finalPrice * 0.03 * 100) / 100;
    await prisma.commission.create({
      data: {
        sellerId: seller.id,
        saleId: sale.id,
        vehicleId: sv.id,
        ruleId: ruleSale.id,
        calcBase: finalPrice,
        percentage: 3,
        amount: commissionAmount,
        status: i === 0 ? 'PAID' : 'PENDING',
        approvedAt: i === 0 ? soldAt : null,
        paidAt: i === 0 ? soldAt : null,
      },
    });
  }

  // ---- Leads ----
  console.log('📞 Leads...');
  await prisma.lead.create({
    data: {
      vehicleId: vehicles[0].id,
      name: 'Pedro Interessado',
      phone: '5454966665555',
      email: 'pedro@email.com',
      origin: 'SPECIALIST_BUTTON',
      assignedSellerId: seller1.id,
      initialMessage: 'Tenho interesse no T-Cross.',
      whatsappUrl: 'https://wa.me/5454999990002?text=Ol%C3%A1',
      status: 'ASSIGNED',
    },
  });
  await prisma.lead.create({
    data: {
      vehicleId: vehicles[1].id,
      name: 'Lucia Compradora',
      phone: '5454955554444',
      origin: 'WEBSITE_FORM',
      assignedSellerId: seller2.id,
      status: 'CONTACTED',
      firstContactAt: new Date(),
    },
  });
  await prisma.lead.create({
    data: {
      customerId: cust1.customer!.id,
      vehicleId: vehicles[2].id,
      name: 'Maria Souza',
      phone: '5454988887777',
      origin: 'WHATSAPP',
      assignedSellerId: seller1.id,
      status: 'CONVERTED',
      convertedAt: new Date(),
    },
  });

  // ---- Favorites ----
  await prisma.favorite.create({
    data: { customerId: cust1.customer!.id, vehicleId: vehicles[0].id },
  });

  // ---- Some pending documents ----
  console.log('🗂️  Documentos...');
  await prisma.document.create({
    data: {
      documentTypeId: docTypes['CRLV'],
      ownerType: 'VEHICLE',
      vehicleId: vehicles[0].id,
      status: 'APPROVED',
      issueDate: new Date('2024-01-10'),
      expiryDate: new Date(Date.now() + 20 * 86400000),
    },
  });
  await prisma.document.create({
    data: {
      documentTypeId: docTypes['LAUDO'],
      ownerType: 'VEHICLE',
      vehicleId: vehicles[6].id,
      status: 'AWAITING_VEHICLE_DOCUMENT',
    },
  });

  // ---- DRE for all vehicles ----
  console.log('📊 Calculando DRE...');
  for (const v of vehicles) {
    await computeDre(v.id);
  }

  // Cross-reference unused vars to satisfy strict lint in seed
  void [cust3, sup2, seller2];

  console.log('\n✅ Seed concluído!\n');
  console.log('Credenciais de desenvolvimento:');
  console.log('  ADMIN   -> admin@autodealer.local  / Admin@123');
  console.log('  SELLER  -> carlos@autodealer.local / Seller@123');
  console.log('  SELLER  -> ana@autodealer.local    / Seller@123');
  console.log('  CUSTOMER-> maria@cliente.com        / Customer@123');
  console.log('  CUSTOMER-> joao@cliente.com         / Customer@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
