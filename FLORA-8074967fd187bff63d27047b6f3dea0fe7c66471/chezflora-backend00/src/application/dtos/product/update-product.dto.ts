// src/application/dtos/product/update-product.dto.ts
export interface UpdateProductDto {
    categoryId?: string;
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    isActive?: boolean;
}