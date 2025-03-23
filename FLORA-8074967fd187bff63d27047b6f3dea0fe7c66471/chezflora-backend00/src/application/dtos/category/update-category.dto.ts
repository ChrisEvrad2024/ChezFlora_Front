// src/application/dtos/category/update-category.dto.ts
export interface UpdateCategoryDto {
    name?: string;
    description?: string;
    parentId?: string | null;
    image?: string;
}