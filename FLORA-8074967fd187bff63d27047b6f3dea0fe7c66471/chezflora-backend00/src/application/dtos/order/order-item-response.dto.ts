// src/application/dtos/order/order-item-response.dto.ts
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