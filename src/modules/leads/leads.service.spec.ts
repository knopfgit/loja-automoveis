import { LeadsService } from './leads.service';

describe('LeadsService.specialistContact', () => {
  const seller = {
    id: 'e1',
    fullName: 'Carlos',
    whatsapp: '54999990002',
    user: { id: 'u1', email: 'carlos@x.com' },
  };

  const prisma: any = {
    vehicle: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'v1',
        brand: 'VW',
        model: 'T-Cross',
        modelYear: 2023,
        publicCode: 'VEI-1',
      }),
      update: jest.fn().mockResolvedValue({}),
    },
    store: {
      findFirst: jest.fn().mockResolvedValue({ whatsapp: '5430001000' }),
    },
    employee: { findMany: jest.fn().mockResolvedValue([seller]) },
    lead: {
      count: jest.fn().mockResolvedValue(0),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'lead1', status: 'ASSIGNED' }),
    },
  };
  const config: any = {
    get: (key: string, def?: any) =>
      ({
        'business.leadAssignmentStrategy': 'least_busy',
        'business.whatsappCountryCode': '55',
      })[key] ?? def,
  };
  const audit: any = { log: jest.fn().mockResolvedValue(undefined) };
  const realtime: any = { emit: jest.fn() };
  const notifications: any = { create: jest.fn().mockResolvedValue(undefined) };

  const service = new LeadsService(
    prisma,
    config,
    audit,
    realtime,
    notifications,
  );

  it('registers a lead, assigns a seller and returns a WhatsApp URL', async () => {
    const result = await service.specialistContact({
      vehicleId: 'v1',
      name: 'Pedro',
      phone: '54988887777',
    });

    expect(result.leadId).toBe('lead1');
    expect(result.assignedSeller).toEqual({ id: 'e1', name: 'Carlos' });
    expect(result.status).toBe('ASSIGNED');
    // Country code (55) prepended to the seller's number (54...).
    expect(result.whatsappUrl).toContain('https://wa.me/5554999990002');
    expect(result.whatsappUrl).toContain('text=');
    expect(prisma.lead.create).toHaveBeenCalled();
    expect(notifications.create).toHaveBeenCalled();
  });
});
