// src/application/dtos/order/order-response.dto.ts
export interface OrderResponseDto {
    id: string;
    userId: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    totalAmount: number;
    shippingAddressId: string;
    paymentMethod: string;
    paymentStatus: string;
    trackingNumber?: string;
    shippedAt?: Date;
    deliveredAt?: Date;
    cancelledAt?: Date;
    items: OrderItemResponseDto[];
    createdAt: Date;
    updatedAt: Date;
}

export interface OrderItemResponseDto {
    id: string;
    orderId: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    createdAt: Date;
    updatedAt: Date;
}