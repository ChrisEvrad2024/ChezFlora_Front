// src/application/dtos/product/product-response.dto.ts
export interface ProductResponseDto {
    id: string;
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    category?: {
        id: string;
        name: string;
    };
    images?: {
        id: string;
        url: string;
        order: number;
    }[];
}