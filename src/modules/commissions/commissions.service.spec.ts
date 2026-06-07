import { CommissionsService } from './commissions.service';

describe('CommissionsService.generateForSale', () => {
  const makePrisma = (): any => ({
    commission: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest
        .fn()
        .mockImplementation(({ data }) => ({ id: 'c1', ...data })),
    },
    employee: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'e1',
        defaultCommissionRule: {
          id: 'r1',
          type: 'PERCENT_SALE',
          percentage: 3,
          active: true,
        },
      }),
    },
    commissionRule: { findFirst: jest.fn().mockResolvedValue(null) },
  });

  const audit: any = { log: jest.fn() };
  const realtime: any = { emit: jest.fn() };
  const dre: any = {
    recalculate: jest.fn().mockResolvedValue({ netProfit: 0 }),
  };
  const notifications: any = { create: jest.fn() };

  it('computes 3% of the final price for PERCENT_SALE rules', async () => {
    const prisma = makePrisma();
    const service = new CommissionsService(
      prisma,
      audit,
      realtime,
      dre,
      notifications,
    );

    const sale: any = {
      id: 's1',
      sellerId: 'e1',
      vehicleId: 'v1',
      finalPrice: 100000,
    };
    const commission = await service.generateForSale(sale);

    expect(prisma.commission.create).toHaveBeenCalled();
    const createdArg = prisma.commission.create.mock.calls[0][0].data;
    expect(createdArg.amount).toBe(3000);
    expect(createdArg.calcBase).toBe(100000);
    expect(commission.amount).toBe(3000);
  });

  it('returns the existing commission if one already exists (idempotent)', async () => {
    const prisma = makePrisma();
    prisma.commission.findUnique.mockResolvedValue({ id: 'existing' });
    const service = new CommissionsService(
      prisma,
      audit,
      realtime,
      dre,
      notifications,
    );
    const result = await service.generateForSale({
      id: 's1',
      sellerId: 'e1',
      vehicleId: 'v1',
      finalPrice: 100000,
    } as any);
    expect(result).toEqual({ id: 'existing' });
    expect(prisma.commission.create).not.toHaveBeenCalled();
  });
});
