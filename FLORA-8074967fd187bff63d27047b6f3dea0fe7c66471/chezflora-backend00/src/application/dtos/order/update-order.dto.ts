// src/application/dtos/order/update-order-status.dto.ts
export interface UpdateOrderStatusDto {
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    trackingNumber?: string;
}