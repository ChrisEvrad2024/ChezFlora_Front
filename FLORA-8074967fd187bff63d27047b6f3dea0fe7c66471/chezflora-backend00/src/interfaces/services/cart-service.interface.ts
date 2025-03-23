// src/interfaces/services/cart-service.interface.ts
import { CartResponseDto } from '../../application/dtos/cart/cart-response.dto';
import { CartItemResponseDto } from '../../application/dtos/cart/cart-item-response.dto';
import { AddToCartDto } from '../../application/dtos/cart/add-to-cart.dto';
import { UpdateCartItemDto } from '../../application/dtos/cart/update-cart-item.dto';

export interface CartServiceInterface {
    getUserCart(userId: string): Promise<CartResponseDto | null>;
    addToCart(userId: string, itemData: AddToCartDto): Promise<CartItemResponseDto>;
    updateCartItem(itemId: string, userId: string, data: UpdateCartItemDto): Promise<CartItemResponseDto | null>;
    removeCartItem(itemId: string, userId: string): Promise<boolean>;
    clearCart(userId: string): Promise<boolean>;
}