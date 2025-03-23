// src/application/dtos/category/create-category.dto.ts
export interface CreateCategoryDto {
    name: string;
    description?: string;
    parentId?: string | null;
    image?: string;
}