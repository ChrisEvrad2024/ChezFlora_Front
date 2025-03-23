// src/application/services/order/cart.service.ts
import { CartServiceInterface } from '../../../interfaces/services/cart-service.interface';
import { CartRepositoryInterface } from '../../../interfaces/repositories/cart-repository.interface';
import { CartResponseDto } from '../../dtos/cart/cart-response.dto';
import { CartItemResponseDto } from '../../dtos/cart/cart-item-response.dto';
import { AddToCartDto } from '../../dtos/cart/add-to-cart.dto';
import { UpdateCartItemDto } from '../../dtos/cart/update-cart-item.dto';
import { AppError } from '../../../infrastructure/http/middlewares/error.middleware';

export class CartService implements CartServiceInterface {
    constructor(private cartRepository: CartRepositoryInterface) {}

    async getUserCart(userId: string): Promise<CartResponseDto | null> {
        const cart = await this.cartRepository.findByUserId(userId);
        
        if (!cart) {
            // Si le panier n'existe pas encore, en créer un vide
            return this.cartRepository.createCart(userId);
        }
        
        return cart;
    }

    async addToCart(userId: string, itemData: AddToCartDto): Promise<CartItemResponseDto> {
        if (!itemData.productId) {
            throw new AppError('Product ID is required', 400);
        }

        if (!itemData.quantity || itemData.quantity <= 0) {
            throw new AppError('Quantity must be greater than 0', 400);
        }

        return this.cartRepository.addItemToCart(userId, itemData);
    }

    async updateCartItem(itemId: string, userId: string, data: UpdateCartItemDto): Promise<CartItemResponseDto | null> {
        if (!itemId) {
            throw new AppError('Item ID is required', 400);
        }

        const updatedItem = await this.cartRepository.updateCartItem(itemId, userId, data);
        
        if (!updatedItem && data.quantity > 0) {
            throw new AppError('Cart item not found or does not belong to you', 404);
        }
        
        return updatedItem;
    }

    async removeCartItem(itemId: string, userId: string): Promise<boolean> {
        if (!itemId) {
            throw new AppError('Item ID is required', 400);
        }

        const removed = await this.cartRepository.removeCartItem(itemId, userId);
        
        if (!removed) {
            throw new AppError('Cart item not found or does not belong to you', 404);
        }
        
        return true;
    }

    async clearCart(userId: string): Promise<boolean> {
        return this.cartRepository.clearCart(userId);
    }
}