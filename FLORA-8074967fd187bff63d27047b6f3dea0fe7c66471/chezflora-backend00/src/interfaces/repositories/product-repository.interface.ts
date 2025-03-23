// src/interfaces/repositories/product-repository.interface.ts
import { ProductEntity } from '../../domain/entities/product.entity';
import { ProductImageEntity } from '../../domain/entities/productImage.entity';

export interface ProductRepositoryInterface {
    findAll(options?: {
        categoryId?: string;
        search?: string;
        minPrice?: number;
        maxPrice?: number;
        isActive?: boolean;
        limit?: number;
        offset?: number;
        sortBy?: string;
        sortOrder?: 'ASC' | 'DESC';
    }): Promise<{ products: ProductEntity[]; total: number }>;
    
    findById(id: string): Promise<ProductEntity | null>;
    
    create(product: Omit<ProductEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductEntity>;
    
    update(id: string, product: Partial<ProductEntity>): Promise<ProductEntity | null>;
    
    delete(id: string): Promise<boolean>;
    
    updateStock(id: string, quantity: number): Promise<ProductEntity | null>;
    
    addImage(productId: string, imageUrl: string, order?: number): Promise<ProductImageEntity>;
    
    removeImage(imageId: string): Promise<boolean>;
    
    reorderImages(productId: string, imageOrders: { id: string; order: number }[]): Promise<boolean>;
}