import { CartItemResponseDto } from "./cart-item-response.dto";

// src/application/dtos/cart/cart-response.dto.ts
export interface CartResponseDto {
    id: string;
    userId: string;
    items: CartItemResponseDto[];
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
}