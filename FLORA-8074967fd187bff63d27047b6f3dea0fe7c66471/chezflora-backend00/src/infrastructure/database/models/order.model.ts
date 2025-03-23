// src/infrastructure/database/models/order.model.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import User from './user.model';
import Address from './address.model';
import OrderItem from './order-item.model';

@Table({
    tableName: 'orders',
    timestamps: true,
    underscored: true,
})
export default class Order extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id!: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        field: 'user_id',
        allowNull: false,
    })
    userId!: string;

    @BelongsTo(() => User)
    user!: User;

    @Column({
        type: DataType.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'pending',
    })
    status!: string;

    @Column({
        type: DataType.DECIMAL(10, 2),
        field: 'total_amount',
        allowNull: false,
    })
    totalAmount!: number;

    @ForeignKey(() => Address)
    @Column({
        type: DataType.UUID,
        field: 'shipping_address_id',
        allowNull: false,
    })
    shippingAddressId!: string;

    @BelongsTo(() => Address)
    shippingAddress!: Address;

    @Column({
        type: DataType.STRING,
        field: 'payment_method',
        allowNull: false,
    })
    paymentMethod!: string;

    @Column({
        type: DataType.STRING,
        field: 'payment_status',
        defaultValue: 'pending',
    })
    paymentStatus!: string;

    @Column({
        type: DataType.STRING,
        field: 'tracking_number',
        allowNull: true,
    })
    trackingNumber?: string;

    @Column({
        type: DataType.DATE,
        field: 'shipped_at',
        allowNull: true,
    })
    shippedAt?: Date;

    @Column({
        type: DataType.DATE,
        field: 'delivered_at',
        allowNull: true,
    })
    deliveredAt?: Date;

    @Column({
        type: DataType.DATE,
        field: 'cancelled_at',
        allowNull: true,
    })
    cancelledAt?: Date;

    @HasMany(() => OrderItem)
    items!: OrderItem[];
}
