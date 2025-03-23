// src/application/dtos/dashboard/report-request.dto.ts
export interface ReportRequestDto {
    reportType: 'sales' | 'products' | 'customers';
    startDate?: string;
    endDate?: string;
    format?: 'pdf' | 'csv' | 'excel';
}