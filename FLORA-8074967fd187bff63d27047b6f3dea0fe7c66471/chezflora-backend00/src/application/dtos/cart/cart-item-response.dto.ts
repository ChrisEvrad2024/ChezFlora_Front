// src/application/dtos/cart/cart-item-response.dto.ts
export interface CartItemResponseDto {
    id: string;
    cartId: string;
    productId: string;
    productName: string;
    productImage?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    createdAt: Date;
    updatedAt: Date;
}