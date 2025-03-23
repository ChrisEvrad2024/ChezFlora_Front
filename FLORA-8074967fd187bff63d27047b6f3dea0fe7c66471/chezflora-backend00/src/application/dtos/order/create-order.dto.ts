// src/application/dtos/order/create-order.dto.ts
export interface CreateOrderDto {
    shippingAddressId: string;
    paymentMethod: string;
}