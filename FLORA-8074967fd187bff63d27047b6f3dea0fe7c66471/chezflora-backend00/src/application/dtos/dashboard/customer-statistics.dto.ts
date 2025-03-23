// src/application/dtos/dashboard/customer-statistics.dto.ts
export interface CustomerStatisticsDto {
    newCustomers: {
        period: string;
        count: number;
    }[];
    topCustomers: {
        userId: string;
        name: string;
        orders: number;
        totalSpent: number;
    }[];
    customerRetention: {
        period: string;
        rate: number;
    }[];
}