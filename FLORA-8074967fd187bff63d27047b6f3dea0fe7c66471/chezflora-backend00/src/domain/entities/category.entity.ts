// src/domain/entities/category.entity.ts
import { ProductEntity } from './product.entity';

export interface CategoryEntity {
    id: string;
    name: string;
    description?: string;
    image?: string;
    parentId: string | null; // Assurez-vous que c'est défini comme ça, sans point d'interrogation
    createdAt: Date;
    updatedAt: Date;
    parentCategory?: CategoryEntity;
    childCategories?: CategoryEntity[];
    products?: ProductEntity[];
}