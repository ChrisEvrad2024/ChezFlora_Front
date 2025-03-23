// src/domain/entities/product.entity.ts
import { ProductImageEntity } from './productImage.entity';
import { CategoryEntity } from './category.entity';

export interface ProductEntity {
    id: string;
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    category?: CategoryEntity;
    images?: ProductImageEntity[]; // Ajoutez cette propriété
}