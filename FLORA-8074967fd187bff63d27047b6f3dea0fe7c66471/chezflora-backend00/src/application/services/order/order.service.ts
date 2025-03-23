// src/application/services/order/order.service.ts
import { OrderServiceInterface } from '../../../interfaces/services/order-service.interface';
import { OrderRepositoryInterface } from '../../../interfaces/repositories/order-repository.interface';
import { OrderResponseDto } from '../../dtos/order/order-response.dto';
import { CreateOrderDto } from '../../dtos/order/create-order.dto';
import { UpdateOrderStatusDto } from '../../dtos/order/update-order-status.dto';
import { AppError } from '../../../infrastructure/http/middlewares/error.middleware';

export class OrderService implements OrderServiceInterface {
    constructor(private orderRepository: OrderRepositoryInterface) {}

    async getOrderById(id: string, userId: string): Promise<OrderResponseDto> {
        const order = await this.orderRepository.findById(id);
        
        if (!order) {
            throw new AppError('Order not found', 404);
        }
        
        // Si l'utilisateur n'est pas admin et n'est pas propriétaire de la commande
        if (userId !== 'admin' && order.userId !== userId) {
            throw new AppError('You do not have permission to view this order', 403);
        }
        
        return order;
    }

    async getUserOrders(userId: string, page: number = 1, limit: number = 10): Promise<{ orders: OrderResponseDto[], total: number, totalPages: number }> {
        const { orders, total } = await this.orderRepository.findByUserId(userId, page, limit);
        
        const totalPages = Math.ceil(total / limit);
        
        return {
            orders,
            total,
            totalPages
        };
    }

    async getAllOrders(page: number = 1, limit: number = 10, status?: string): Promise<{ orders: OrderResponseDto[], total: number, totalPages: number }> {
        const { orders, total } = await this.orderRepository.findAll(page, limit, status);
        
        const totalPages = Math.ceil(total / limit);
        
        return {
            orders,
            total,
            totalPages
        };
    }

    async createOrder(userId: string, orderData: CreateOrderDto): Promise<OrderResponseDto> {
        if (!orderData.shippingAddressId) {
            throw new AppError('Shipping address is required', 400);
        }
        
        if (!orderData.paymentMethod) {
            throw new AppError('Payment method is required', 400);
        }
        
        return this.orderRepository.createFromCart(userId, orderData);
    }

    async updateOrderStatus(id: string, userId: string, statusData: UpdateOrderStatusDto): Promise<OrderResponseDto> {
        if (!id) {
            throw new AppError('Order ID is required', 400);
        }
        
        if (!statusData.status) {
            throw new AppError('Status is required', 400);
        }
        
        // Vérifier si le statut est valide
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(statusData.status)) {
            throw new AppError('Invalid status', 400);
        }
        
        // Si le statut est "shipped", vérifier le numéro de suivi
        if (statusData.status === 'shipped' && !statusData.trackingNumber) {
            throw new AppError('Tracking number is required for shipped orders', 400);
        }
        
        const updatedOrder = await this.orderRepository.updateStatus(id, userId, statusData);
        
        if (!updatedOrder) {
            throw new AppError('Order not found', 404);
        }
        
        return updatedOrder;
    }

    async cancelOrder(id: string, userId: string): Promise<OrderResponseDto> {
        if (!id) {
            throw new AppError('Order ID is required', 400);
        }
        
        const isCancellable = await this.orderRepository.isOrderCancellable(id);
        
        if (!isCancellable) {
            throw new AppError('This order cannot be cancelled', 400);
        }
        
        const cancelledOrder = await this.orderRepository.cancelOrder(id, userId);
        
        if (!cancelledOrder) {
            throw new AppError('Order not found', 404);
        }
        
        return cancelledOrder;
    }
}