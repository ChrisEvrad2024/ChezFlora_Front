// src/application/dtos/category/category-response.dto.ts
export interface CategoryResponseDto {
    id: string;
    name: string;
    description?: string;
    image?: string;
    parentId?: string | null;
    createdAt: Date;
    updatedAt: Date;
    parentCategory?: {
        id: string;
        name: string;
    };
    childCategories?: CategoryResponseDto[];
    products?: {
        id: string;
        name: string;
        price: number;
        stock: number;
        isActive: boolean;
    }[];
}