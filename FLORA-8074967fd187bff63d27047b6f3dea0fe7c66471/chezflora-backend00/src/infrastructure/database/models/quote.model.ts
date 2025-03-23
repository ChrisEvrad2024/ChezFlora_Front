// src/infrastructure/database/models/quote.model.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import User from './user.model';
import QuoteItem from './quote-item.model';

@Table({
    tableName: 'quotes',
    timestamps: true,
    underscored: true,
})
export default class Quote extends Model {
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
        type: DataType.ENUM('requested', 'processing', 'sent', 'accepted', 'rejected', 'expired'),
        defaultValue: 'requested',
    })
    status!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    title!: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    description!: string;

    @Column({
        type: DataType.STRING,
        field: 'event_type',
        allowNull: true,
    })
    eventType?: string;

    @Column({
        type: DataType.DATE,
        field: 'event_date',
        allowNull: true,
    })
    eventDate?: Date;

    @Column({
        type: DataType.DATE,
        field: 'valid_until',
        allowNull: true,
    })
    validUntil?: Date;

    @Column({
        type: DataType.DECIMAL(10, 2),
        field: 'total_amount',
        allowNull: true,
    })
    totalAmount?: number;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: true,
    })
    budget?: number;

    @Column({
        type: DataType.TEXT,
        field: 'customer_comment',
        allowNull: true,
    })
    customerComment?: string;

    @Column({
        type: DataType.TEXT,
        field: 'admin_comment',
        allowNull: true,
    })
    adminComment?: string;

    @Column({
        type: DataType.DATE,
        field: 'accepted_at',
        allowNull: true,
    })
    acceptedAt?: Date;

    @Column({
        type: DataType.DATE,
        field: 'rejected_at',
        allowNull: true,
    })
    rejectedAt?: Date;

    @HasMany(() => QuoteItem)
    items!: QuoteItem[];
}