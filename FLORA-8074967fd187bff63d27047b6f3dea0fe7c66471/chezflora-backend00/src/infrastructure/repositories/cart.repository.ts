// src/infrastructure/repositories/cart.repository.ts
import { CartRepositoryInterface } from '../../interfaces/repositories/cart-repository.interface';
import { CartResponseDto } from '../../application/dtos/cart/cart-response.dto';
import { CartItemResponseDto } from '../../application/dtos/cart/cart-item-response.dto';
import { AddToCartDto } from '../../application/dtos/cart/add-to-cart.dto';
import { UpdateCartItemDto } from '../../application/dtos/cart/update-cart-item.dto';
import Cart from '../database/models/cart.model';
import CartItem from '../database/models/cart-item.model';
import Product from '../database/models/product.model';
import  sequelize  from '../config/database';
import { AppError } from '../http/middlewares/error.middleware';

export class CartRepository implements CartRepositoryInterface {
    async findByUserId(userId: string): Promise<CartResponseDto | null> {
        const cart = await Cart.findOne({
            where: { userId },
            include: [
                {
                    model: CartItem,
                    include: [Product],
                },
            ],
        });

        if (!cart) {
            return null;
        }

        // Calculer le montant total
        const totalAmount = this.calculateTotalAmount(cart.items);

        // Transformer les données
        return {
            id: cart.id,
            userId: cart.userId,
            items: cart.items.map((item) => ({
                id: item.id,
                cartId: item.cartId,
                productId: item.productId,
                productName: item.product.name,
                productImage: item.product.image,
                quantity: item.quantity,
                unitPrice: parseFloat(item.unitPrice.toString()),
                totalPrice: parseFloat((item.quantity * item.unitPrice).toString()),
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            })),
            totalAmount,
            createdAt: cart.createdAt,
            updatedAt: cart.updatedAt,
        };
    }

    async createCart(userId: string): Promise<CartResponseDto> {
        const cart = await Cart.create({ userId });

        return {
            id: cart.id,
            userId: cart.userId,
            items: [],
            totalAmount: 0,
            createdAt: cart.createdAt,
            updatedAt: cart.updatedAt,
        };
    }

    async addItemToCart(userId: string, itemData: AddToCartDto): Promise<CartItemResponseDto> {
        const transaction = await sequelize.transaction();

        try {
            // Vérifier si le produit existe
            const product = await Product.findByPk(itemData.productId, { transaction });
            if (!product) {
                await transaction.rollback();
                throw new AppError('Product not found', 404);
            }

            // Vérifier le stock
            if (product.stock < itemData.quantity) {
                await transaction.rollback();
                throw new AppError(`Not enough stock. Only ${product.stock} available.`, 400);
            }

            // Trouver ou créer le panier
            let cart = await Cart.findOne({ where: { userId }, transaction });
            if (!cart) {
                cart = await Cart.create({ userId }, { transaction });
            }

            // Vérifier si l'article existe déjà dans le panier
            let cartItem = await CartItem.findOne({
                where: { cartId: cart.id, productId: itemData.productId },
                transaction,
            });

            // Si l'article existe, mettre à jour la quantité
            if (cartItem) {
                const newQuantity = cartItem.quantity + itemData.quantity;
                
                // Vérifier le stock pour la quantité totale
                if (product.stock < newQuantity) {
                    await transaction.rollback();
                    throw new AppError(`Not enough stock. Only ${product.stock} available.`, 400);
                }
                
                await cartItem.update({ quantity: newQuantity }, { transaction });
            } else {
                // Sinon, créer un nouvel article
                cartItem = await CartItem.create(
                    {
                        cartId: cart.id,
                        productId: itemData.productId,
                        quantity: itemData.quantity,
                        unitPrice: product.price,
                    },
                    { transaction }
                );
            }

            await transaction.commit();

            return {
                id: cartItem.id,
                cartId: cartItem.cartId,
                productId: cartItem.productId,
                productName: product.name,
                productImage: product.image,
                quantity: cartItem.quantity,
                unitPrice: parseFloat(cartItem.unitPrice.toString()),
                totalPrice: parseFloat((cartItem.quantity * cartItem.unitPrice).toString()),
                createdAt: cartItem.createdAt,
                updatedAt: cartItem.updatedAt,
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async updateCartItem(itemId: string, userId: string, data: UpdateCartItemDto): Promise<CartItemResponseDto | null> {
        const transaction = await sequelize.transaction();

        try {
            // Vérifier si l'article existe et appartient à l'utilisateur
            const cartItem = await CartItem.findByPk(itemId, {
                include: [
                    {
                        model: Cart,
                        where: { userId },
                        required: true,
                    },
                    Product,
                ],
                transaction,
            });

            if (!cartItem) {
                await transaction.rollback();
                return null;
            }

            // Si la quantité est 0 ou moins, supprimer l'article
            if (data.quantity <= 0) {
                await cartItem.destroy({ transaction });
                await transaction.commit();
                return null;
            }

            // Vérifier le stock
            if (cartItem.product.stock < data.quantity) {
                await transaction.rollback();
                throw new AppError(`Not enough stock. Only ${cartItem.product.stock} available.`, 400);
            }

            // Mettre à jour la quantité
            await cartItem.update({ quantity: data.quantity }, { transaction });

            await transaction.commit();

            return {
                id: cartItem.id,
                cartId: cartItem.cartId,
                productId: cartItem.productId,
                productName: cartItem.product.name,
                productImage: cartItem.product.image,
                quantity: data.quantity,
                unitPrice: parseFloat(cartItem.unitPrice.toString()),
                totalPrice: parseFloat((data.quantity * cartItem.unitPrice).toString()),
                createdAt: cartItem.createdAt,
                updatedAt: cartItem.updatedAt,
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async removeCartItem(itemId: string, userId: string): Promise<boolean> {
        const transaction = await sequelize.transaction();

        try {
            // Vérifier si l'article existe et appartient à l'utilisateur
            const cartItem = await CartItem.findOne({
                include: [
                    {
                        model: Cart,
                        where: { userId },
                        required: true,
                    },
                ],
                where: { id: itemId },
                transaction,
            });

            if (!cartItem) {
                await transaction.rollback();
                return false;
            }

            // Supprimer l'article
            await cartItem.destroy({ transaction });

            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async clearCart(userId: string): Promise<boolean> {
        const transaction = await sequelize.transaction();

        try {
            // Trouver le panier de l'utilisateur
            const cart = await Cart.findOne({ where: { userId }, transaction });

            if (!cart) {
                await transaction.rollback();
                return false;
            }

            // Supprimer tous les articles du panier
            await CartItem.destroy({ where: { cartId: cart.id }, transaction });

            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async getCartTotalAmount(userId: string): Promise<number> {
        const cart = await Cart.findOne({
            where: { userId },
            include: [
                {
                    model: CartItem,
                },
            ],
        });

        if (!cart) {
            return 0;
        }

        return this.calculateTotalAmount(cart.items);
    }

    private calculateTotalAmount(items: CartItem[]): number {
        return items.reduce((total, item) => {
            return total + parseFloat(item.unitPrice.toString()) * item.quantity;
        }, 0);
    }
}