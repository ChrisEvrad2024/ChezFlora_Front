// src/application/dtos/dashboard/product-statistics.dto.ts
export interface ProductStatisticsDto {
    topSellingProducts: {
        id: string;
        name: string;
        totalQuantity: number;
        totalSales: number;
    }[];
    categorySales: {
        categoryId: string;
        name: string;
        sales: number;
        orders: number;
    }[];
    lowStockProducts: {
        id: string;
        name: string;
        stock: number;
        requiredStock: number;
    }[];
    outOfStockProducts: {
        id: string;
        name: string;
    }[];
}