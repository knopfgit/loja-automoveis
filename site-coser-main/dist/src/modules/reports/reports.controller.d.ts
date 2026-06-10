import { Response } from 'express';
import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly service;
    constructor(service: ReportsService);
    private respond;
    private run;
    vehiclesStock(res: Response, format?: string): Promise<void>;
    vehiclesSold(res: Response, format?: string): Promise<void>;
    vehiclesAvailable(res: Response, format?: string): Promise<void>;
    vehiclesStale(res: Response, days?: string, format?: string): Promise<void>;
    dreConsolidated(res: Response, from?: string, to?: string, format?: string): Promise<void>;
    dreByVehicle(vehicleId: string, res: Response, format?: string): Promise<void>;
    salesByPeriod(res: Response, from?: string, to?: string, format?: string): Promise<void>;
    salesBySeller(res: Response, format?: string): Promise<void>;
    commissions(res: Response, format?: string): Promise<void>;
    documentsPending(res: Response, format?: string): Promise<void>;
    documentsExpiring(res: Response, days?: string, format?: string): Promise<void>;
    maintenances(res: Response, format?: string): Promise<void>;
    futureRevisions(res: Response, format?: string): Promise<void>;
    partsStock(res: Response, format?: string): Promise<void>;
    partsLowStock(res: Response, format?: string): Promise<void>;
    leads(res: Response, format?: string): Promise<void>;
    conversions(res: Response, format?: string): Promise<void>;
    marketingInterested(res: Response, format?: string): Promise<void>;
}
