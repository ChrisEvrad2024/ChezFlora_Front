// src/infrastructure/database/models/invoice.model.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import Order from './order.model';

@Table({
    tableName: 'invoices',
    timestamps: true,
    underscored: true,
})
export default class Invoice extends Model {
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
        unique: true,
    })
    orderId!: string;

    @BelongsTo(() => Order)
    order!: Order;

    @Column({
        type: DataType.STRING,
        field: 'invoice_number',
        allowNull: false,
        unique: true,
    })
    invoiceNumber!: string;

    @Column({
        type: DataType.DATE,
        field: 'invoice_date',
        allowNull: false,
        defaultValue: DataType.NOW,
    })
    invoiceDate!: Date;

    @Column({
        type: DataType.DATE,
        field: 'due_date',
        allowNull: false,
    })
    dueDate!: Date;

    @Column({
        type: DataType.DECIMAL(10, 2),
        field: 'total_amount',
        allowNull: false,
    })
    totalAmount!: number;

    @Column({
        type: DataType.DECIMAL(10, 2),
        field: 'tax_amount',
        allowNull: false,
        defaultValue: 0,
    })
    taxAmount!: number;

    @Column({
        type: DataType.ENUM('pending', 'paid', 'cancelled'),
        defaultValue: 'pending',
    })
    status!: string;

    @Column({
        type: DataType.DATE,
        field: 'payment_date',
        allowNull: true,
    })
    paymentDate?: Date;

    @Column({
        type: DataType.STRING,
        field: 'file_url',
        allowNull: true,
    })
    fileUrl?: string;
}