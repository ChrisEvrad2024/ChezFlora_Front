// src/domain/entities/productImage.entity.ts
export interface ProductImageEntity {
    id: string;
    productId: string;
    url: string;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}