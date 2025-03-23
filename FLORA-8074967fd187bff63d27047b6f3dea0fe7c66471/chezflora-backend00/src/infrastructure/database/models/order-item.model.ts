// src/infrastructure/database/models/order-item.model.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import Order from './order.model';
import Product from './product.model';

@Table({
    tableName: 'order_items',
    timestamps: true,
    underscored: true,
})
export default class OrderItem extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id!: string;

    @ForeignKey(() => Order)
    @Column({
        type: DataType.UUID,
        field: 'order_id',
        allowNull: false,
    })
    orderId!: string;

    @BelongsTo(() => Order)
    order!: Order;

    @ForeignKey(() => Product)
    @Column({
        type: DataType.UUID,
        field: 'product_id',
        allowNull: false,
    })
    productId!: string;

    @BelongsTo(() => Product)
    product!: Product;

    @Column({
        type: DataType.STRING,
        field: 'product_name',
        allowNull: false,
    })
    productName!: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    quantity!: number;

    @Column({
        type: DataType.DECIMAL(10, 2),
        field: 'unit_price',
        allowNull: false,
    })
    unitPrice!: number;

    @Column({
        type: DataType.DECIMAL(10, 2),
        field: 'total_price',
        allowNull: false,
    })
    totalPrice!: number;
}