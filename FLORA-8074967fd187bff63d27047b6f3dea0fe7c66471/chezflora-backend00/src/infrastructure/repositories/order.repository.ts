// src/infrastructure/repositories/order.repository.ts
import { OrderRepositoryInterface } from '../../interfaces/repositories/order-repository.interface';
import { OrderResponseDto } from '../../application/dtos/order/order-response.dto';
import { CreateOrderDto } from '../../application/dtos/order/create-order.dto';
import { UpdateOrderStatusDto } from '../../application/dtos/order/update-order-status.dto';
import Order from '../database/models/order.model';
import OrderItem from '../database/models/order-item.model';
import Product from '../database/models/product.model';
import Cart from '../database/models/cart.model';
import CartItem from '../database/models/cart-item.model';
import  sequelize  from '../config/database';
import { AppError } from '../http/middlewares/error.middleware';
import Address from '../database/models/address.model';
import User from '../database/models/user.model';

export class OrderRepository implements OrderRepositoryInterface {
    async findById(id: string): Promise<OrderResponseDto | null> {
        const order = await Order.findByPk(id, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: Address,
                    as: 'shippingAddress'
                },
                {
                    model: OrderItem,
                    include: [Product]
                }
            ]
        });

        if (!order) {
            return null;
        }

        return this.formatOrderResponse(order);
    }

    async findByUserId(userId: string, page: number = 1, limit: number = 10): Promise<{ orders: OrderResponseDto[], total: number }> {
        const offset = (page - 1) * limit;

        const { rows, count } = await Order.findAndCountAll({
            where: { userId },
            include: [
                {
                    model: OrderItem,
                    include: [Product]
                }
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        const orders = rows.map(order => this.formatOrderResponse(order));

        return {
            orders,
            total: count
        };
    }

    async findAll(page: number = 1, limit: number = 10, status?: string): Promise<{ orders: OrderResponseDto[], total: number }> {
        const offset = (page - 1) * limit;
        const where = status ? { status } : {};

        const { rows, count } = await Order.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: OrderItem,
                    include: [Product]
                }
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        const orders = rows.map(order => this.formatOrderResponse(order));

        return {
            orders,
            total: count
        };
    }

    async createFromCart(userId: string, orderData: CreateOrderDto): Promise<OrderResponseDto> {
        const transaction = await sequelize.transaction();

        try {
            // Vérifier si l'adresse existe et appartient à l'utilisateur
            const address = await Address.findOne({
                where: {
                    id: orderData.shippingAddressId,
                    userId
                },
                transaction
            });

            if (!address) {
                await transaction.rollback();
                throw new AppError('Shipping address not found', 404);
            }

            // Récupérer le panier avec ses articles
            const cart = await Cart.findOne({
                where: { userId },
                include: [
                    {
                        model: CartItem,
                        include: [Product]
                    }
                ],
                transaction
            });

            if (!cart || !cart.items.length) {
                await transaction.rollback();
                throw new AppError('Cart is empty', 400);
            }

            // Vérifier le stock pour chaque article
            for (const item of cart.items) {
                if (item.quantity > item.product.stock) {
                    await transaction.rollback();
                    throw new AppError(`Not enough stock for product ${item.product.name}. Only ${item.product.stock} available.`, 400);
                }
            }

            // Calculer le montant total
            const totalAmount = cart.items.reduce((total, item) => {
                return total + parseFloat(item.unitPrice.toString()) * item.quantity;
            }, 0);

            // Créer la commande
            const order = await Order.create(
                {
                    userId,
                    status: 'pending',
                    totalAmount,
                    shippingAddressId: orderData.shippingAddressId,
                    paymentMethod: orderData.paymentMethod,
                    paymentStatus: 'pending'
                },
                { transaction }
            );

            // Créer les articles de la commande
            for (const cartItem of cart.items) {
                await OrderItem.create(
                    {
                        orderId: order.id,
                        productId: cartItem.productId,
                        productName: cartItem.product.name,
                        quantity: cartItem.quantity,
                        unitPrice: cartItem.unitPrice,
                        totalPrice: parseFloat(cartItem.unitPrice.toString()) * cartItem.quantity
                    },
                    { transaction }
                );

                // Mettre à jour le stock du produit
                await cartItem.product.update(
                    {
                        stock: cartItem.product.stock - cartItem.quantity
                    },
                    { transaction }
                );
            }

            // Vider le panier
            await CartItem.destroy({
                where: { cartId: cart.id },
                transaction
            });

            // Récupérer la commande complète avec ses articles
            const createdOrder = await Order.findByPk(order.id, {
                include: [
                    {
                        model: OrderItem,
                        include: [Product]
                    }
                ],
                transaction
            });

            await transaction.commit();

            return this.formatOrderResponse(createdOrder);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async updateStatus(id: string, userId: string, statusData: UpdateOrderStatusDto): Promise<OrderResponseDto | null> {
        const transaction = await sequelize.transaction();

        try {
            // Vérifier si la commande existe
            const order = await Order.findByPk(id, {
                include: [OrderItem],
                transaction
            });

            if (!order) {
                await transaction.rollback();
                return null;
            }

            // Pour les utilisateurs non-admin, vérifier si la commande leur appartient
            if (userId !== 'admin' && order.userId !== userId) {
                await transaction.rollback();
                throw new AppError('You do not have permission to update this order', 403);
            }

            // Vérifier si le statut peut être mis à jour
            if (order.status === 'cancelled' || order.status === 'delivered') {
                await transaction.rollback();
                throw new AppError(`Cannot update status of ${order.status} order`, 400);
            }

            // Préparer les données à mettre à jour
            const updateData: any = { status: statusData.status };

            // Ajouter des informations supplémentaires en fonction du statut
            if (statusData.status === 'shipped') {
                updateData.shippedAt = new Date();
                updateData.trackingNumber = statusData.trackingNumber;
            } else if (statusData.status === 'delivered') {
                updateData.deliveredAt = new Date();
            } else if (statusData.status === 'cancelled') {
                updateData.cancelledAt = new Date();

                // Remettre les produits en stock
                for (const item of order.items) {
                    const product = await Product.findByPk(item.productId, { transaction });
                    if (product) {
                        await product.update(
                            {
                                stock: product.stock + item.quantity
                            },
                            { transaction }
                        );
                    }
                }
            }

            // Mettre à jour la commande
            await order.update(updateData, { transaction });

            // Récupérer la commande mise à jour
            const updatedOrder = await Order.findByPk(id, {
                include: [
                    {
                        model: OrderItem,
                        include: [Product]
                    }
                ],
                transaction
            });

            await transaction.commit();

            return this.formatOrderResponse(updatedOrder);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async cancelOrder(id: string, userId: string): Promise<OrderResponseDto | null> {
        // Vérifier si la commande est annulable
        const isCancellable = await this.isOrderCancellable(id);
        if (!isCancellable) {
            throw new AppError('Order cannot be cancelled', 400);
        }

        // Utiliser la méthode updateStatus pour annuler la commande
        return this.updateStatus(id, userId, { status: 'cancelled' });
    }

    async isOrderCancellable(id: string): Promise<boolean> {
        const order = await Order.findByPk(id);

        if (!order) {
            return false;
        }

        // Une commande est annulable si elle est en statut 'pending' ou 'processing'
        return ['pending', 'processing'].includes(order.status);
    }

    private formatOrderResponse(order: any): OrderResponseDto {
        return {
            id: order.id,
            userId: order.userId,
            status: order.status,
            totalAmount: parseFloat(order.totalAmount.toString()),
            shippingAddressId: order.shippingAddressId,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            trackingNumber: order.trackingNumber,
            shippedAt: order.shippedAt,
            deliveredAt: order.deliveredAt,
            cancelledAt: order.cancelledAt,
            items: order.items?.map((item: any) => ({
                id: item.id,
                orderId: item.orderId,
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: parseFloat(item.unitPrice.toString()),
                totalPrice: parseFloat(item.totalPrice.toString()),
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            })) || [],
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
        };
    }
}