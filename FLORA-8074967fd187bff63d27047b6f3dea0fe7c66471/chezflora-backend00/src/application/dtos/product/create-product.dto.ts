// src/application/dtos/product/create-product.dto.ts
export interface CreateProductDto {
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    isActive?: boolean;
}