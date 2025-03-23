// src/interfaces/repositories/order-repository.interface.ts
import { OrderResponseDto } from '../../application/dtos/order/order-response.dto';
import { CreateOrderDto } from '../../application/dtos/order/create-order.dto';
import { UpdateOrderStatusDto } from '../../application/dtos/order/update-order-status.dto';

export interface OrderRepositoryInterface {
    findById(id: string): Promise<OrderResponseDto | null>;
    findByUserId(userId: string, page?: number, limit?: number): Promise<{ orders: OrderResponseDto[], total: number }>;
    findAll(page?: number, limit?: number, status?: string): Promise<{ orders: OrderResponseDto[], total: number }>;
    createFromCart(userId: string, orderData: CreateOrderDto): Promise<OrderResponseDto>;
    updateStatus(id: string, userId: string, statusData: UpdateOrderStatusDto): Promise<OrderResponseDto | null>;
    cancelOrder(id: string, userId: string): Promise<OrderResponseDto | null>;
    isOrderCancellable(id: string): Promise<boolean>;
}