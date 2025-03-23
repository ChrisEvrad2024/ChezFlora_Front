// src/interfaces/services/order-service.interface.ts
import { OrderResponseDto } from '../../application/dtos/order/order-response.dto';
import { CreateOrderDto } from '../../application/dtos/order/create-order.dto';
import { UpdateOrderStatusDto } from '../../application/dtos/order/update-order-status.dto';

export interface OrderServiceInterface {
    getOrderById(id: string, userId: string): Promise<OrderResponseDto>;
    getUserOrders(userId: string, page?: number, limit?: number): Promise<{ orders: OrderResponseDto[], total: number, totalPages: number }>;
    getAllOrders(page?: number, limit?: number, status?: string): Promise<{ orders: OrderResponseDto[], total: number, totalPages: number }>;
    createOrder(userId: string, orderData: CreateOrderDto): Promise<OrderResponseDto>;
    updateOrderStatus(id: string, userId: string, statusData: UpdateOrderStatusDto): Promise<OrderResponseDto>;
    cancelOrder(id: string, userId: string): Promise<OrderResponseDto>;
}