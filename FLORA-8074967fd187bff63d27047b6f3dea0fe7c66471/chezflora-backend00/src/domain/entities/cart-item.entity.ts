// src/domain/entities/cartItem.entity.ts
export interface CartItemEntity {
    id: string;
    cartId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    createdAt: Date;
    updatedAt: Date;
}