// src/infrastructure/http/controllers/order.controller.ts
import { Request, Response, NextFunction } from 'express';
import { OrderServiceInterface } from '../../../interfaces/services/order-service.interface';
import { CreateOrderDto } from '../../../application/dtos/order/create-order.dto';
import { UpdateOrderStatusDto } from '../../../application/dtos/order/update-order-status.dto';
import { AppError } from '../middlewares/error.middleware';

export class OrderController {
    constructor(private orderService: OrderServiceInterface) {}

    getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            const orderId = req.params.id;

            if (!userId) {
                throw new AppError('Authentication required', 401);
            }

            const order = await this.orderService.getOrderById(orderId, userId);

            res.status(200).json({
                success: true,
                message: 'Order retrieved successfully',
                data: order
            });
        } catch (error) {
            next(error);
        }
    };

    getUserOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            if (!userId) {
                throw new AppError('Authentication required', 401);
            }

            const { orders, total, totalPages } = await this.orderService.getUserOrders(userId, page, limit);

            res.status(200).json({
                success: true,
                message: 'Orders retrieved successfully',
                data: orders,
                pagination: {
                    current: page,
                    limit,
                    total,
                    totalPages
                }
            });
        } catch (error) {
            next(error);
        }
    };

    getAllOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const status = req.query.status as string;

            // Vérifier si l'utilisateur est admin
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }

            const { orders, total, totalPages } = await this.orderService.getAllOrders(page, limit, status);

            res.status(200).json({
                success: true,
                message: 'Orders retrieved successfully',
                data: orders,
                pagination: {
                    current: page,
                    limit,
                    total,
                    totalPages
                }
            });
        } catch (error) {
            next(error);
        }
    };

    createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError('Authentication required', 401);
            }

            const orderData: CreateOrderDto = req.body;
            const order = await this.orderService.createOrder(userId, orderData);

            res.status(201).json({
                success: true,
                message: 'Order created successfully',
                data: order
            });
        } catch (error) {
            next(error);
        }
    };

    updateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            const orderId = req.params.id;

            if (!userId) {
                throw new AppError('Authentication required', 401);
            }

            // Vérifier si l'utilisateur est admin pour les mises à jour de statut
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }

            const statusData: UpdateOrderStatusDto = req.body;
            const updatedOrder = await this.orderService.updateOrderStatus(orderId, 'admin', statusData);

            res.status(200).json({
                success: true,
                message: 'Order status updated successfully',
                data: updatedOrder
            });
        } catch (error) {
            next(error);
        }
    };

    cancelOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            const orderId = req.params.id;

            if (!userId) {
                throw new AppError('Authentication required', 401);
            }

            const cancelledOrder = await this.orderService.cancelOrder(orderId, userId);

            res.status(200).json({
                success: true,
                message: 'Order cancelled successfully',
                data: cancelledOrder
            });
        } catch (error) {
            next(error);
        }
    };
}