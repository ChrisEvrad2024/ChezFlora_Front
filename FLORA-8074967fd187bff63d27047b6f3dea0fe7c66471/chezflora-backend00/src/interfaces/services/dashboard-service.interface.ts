// src/interfaces/services/dashboard-service.interface.ts
import { DashboardSummaryDto } from '../../application/dtos/dashboard/dashboard-summary.dto';
import { SalesStatisticsDto } from '../../application/dtos/dashboard/sales-statistics.dto';
import { ProductStatisticsDto } from '../../application/dtos/dashboard/product-statistics.dto';
import { CustomerStatisticsDto } from '../../application/dtos/dashboard/customer-statistics.dto';
import { ReportRequestDto } from '../../application/dtos/dashboard/report-request.dto';

export interface DashboardServiceInterface {
    getDashboardSummary(): Promise<DashboardSummaryDto>;
    getSalesStatistics(startDate?: Date, endDate?: Date): Promise<SalesStatisticsDto>;
    getProductStatistics(): Promise<ProductStatisticsDto>;
    getCustomerStatistics(startDate?: Date, endDate?: Date): Promise<CustomerStatisticsDto>;
    generateReport(request: ReportRequestDto): Promise<{ url: string; filename: string }>;
}