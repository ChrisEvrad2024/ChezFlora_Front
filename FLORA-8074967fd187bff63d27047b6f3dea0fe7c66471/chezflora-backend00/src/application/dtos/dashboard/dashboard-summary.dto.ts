// src/application/dtos/dashboard/dashboard-summary.dto.ts
export interface DashboardSummaryDto {
    totalSales: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    pendingOrders: number;
    pendingQuotes: number;
    lowStockProducts: number;
    monthlySales: {
        month: string;
        sales: number;
    }[];
    recentOrders: {
        id: string;
        userId: string;
        customerName: string;
        status: string;
        totalAmount: number;
        createdAt: Date;
    }[];
}