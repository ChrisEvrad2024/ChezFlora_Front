// src/infrastructure/http/controllers/cart.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../infrastructure/http/middlewares/error.middleware';

// Définition des interfaces et types manquants
interface CartServiceInterface {
    getUserCart(userId: string): Promise<any>;
    addToCart(userId: string, itemData: AddToCartDto): Promise<any>;
    updateCartItem(itemId: string, userId: string, data: UpdateCartItemDto): Promise<any>;
    removeCartItem(itemId: string, userId: string): Promise<boolean>;
    clearCart(userId: string): Promise<boolean>;
}

interface AddToCartDto {
    productId: string;
    quantity: number;
}

interface UpdateCartItemDto {
    quantity: number;
}

export class CartController {
    constructor(private cartService: CartServiceInterface) {}

    getUserCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError('Authentication required', 401);
            }

            const cart = await this.cartService.getUserCart(userId);

            res.status(200).json({
                success: true,
                message: 'Cart retrieved successfully',
                data: cart
            });
        } catch (error) {
            next(error);
        }
    };

    addToCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError('Authentication required', 401);
            }

            const itemData: AddToCartDto = req.body;
            const addedItem = await this.cartService.addToCart(userId, itemData);

            res.status(200).json({
                success: true,
                message: 'Item added to cart successfully',
                data: addedItem
            });
        } catch (error) {
            next(error);
        }
    };

    updateCartItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            const itemId = req.params.id;

            if (!userId) {
                throw new AppError('Authentication required', 401);
            }

            const updateData: UpdateCartItemDto = req.body;
            const updatedItem = await this.cartService.updateCartItem(itemId, userId, updateData);

            if (!updatedItem) {
                res.status(200).json({
                    success: true,
                    message: 'Item removed from cart',
                    data: null
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Cart item updated successfully',
                data: updatedItem
            });
        } catch (error) {
            next(error);
        }
    };

    removeCartItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            const itemId = req.params.id;

            if (!userId) {
                throw new AppError('Authentication required', 401);
            }

            await this.cartService.removeCartItem(itemId, userId);

            res.status(200).json({
                success: true,
                message: 'Item removed from cart successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    clearCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError('Authentication required', 401);
            }

            await this.cartService.clearCart(userId);

            res.status(200).json({
                success: true,
                message: 'Cart cleared successfully'
            });
        } catch (error) {
            next(error);
        }
    };
}