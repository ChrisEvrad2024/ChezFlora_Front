// src/domain/repositories/product-repository.interface.ts
import { ProductEntity } from '../entities/product.entity';

export interface ProductRepository {
    findAll(options?: {
        categoryId?: string;
        isActive?: boolean;
        limit?: number;
        offset?: number;
        search?: string;
    }): Promise<{ products: ProductEntity[]; total: number }>;
    findById(id: string): Promise<ProductEntity | null>;
    create(data: Omit<ProductEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductEntity>;
    update(id: string, data: Partial<ProductEntity>): Promise<ProductEntity | null>;
    delete(id: string): Promise<boolean>;
    updateStock(id: string, quantity: number): Promise<ProductEntity | null>;
}