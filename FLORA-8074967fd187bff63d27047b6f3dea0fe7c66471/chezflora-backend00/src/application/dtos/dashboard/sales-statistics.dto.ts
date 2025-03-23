// src/application/dtos/dashboard/sales-statistics.dto.ts
export interface SalesStatisticsDto {
    dailySales: {
        date: string;
        orders: number;
        sales: number;
    }[];
    monthlySales: {
        month: string;
        orders: number;
        sales: number;
    }[];
    yearlySales: {
        year: string;
        orders: number;
        sales: number;
    }[];
    salesByPaymentMethod: {
        paymentMethod: string;
        orders: number;
        sales: number;
    }[];
    averageOrderValue: number;
}