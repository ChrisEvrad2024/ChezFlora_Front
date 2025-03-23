// src/application/dtos/product/product-filter.dto.ts
export interface ProductFilterDto {
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}