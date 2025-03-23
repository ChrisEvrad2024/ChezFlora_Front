// src/domain/entities/orderItem.entity.ts
export interface OrderItemEntity {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    createdAt: Date;
    updatedAt: Date;
}