// src/domain/entities/order.entity.ts
export interface OrderEntity {
    id: string;
    userId: string;
    status: 'pending' | 'processing' | 'shipping' | 'delivered' | 'cancelled' | 'returned';
    totalAmount: number;
    shippingAddressId: string;
    paymentMethod: string;
    createdAt: Date;
    updatedAt: Date;
}
