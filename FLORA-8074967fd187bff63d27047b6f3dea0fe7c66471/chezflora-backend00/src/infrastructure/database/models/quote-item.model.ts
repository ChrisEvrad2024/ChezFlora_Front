// src/infrastructure/database/models/quote-item.model.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import Quote from './quote.model';
import Product from './product.model';

@Table({
    tableName: 'quote_items',
    timestamps: true,
    underscored: true,
})
export default class QuoteItem extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id!: string;

    @ForeignKey(() => Quote)
    @Column({
        type: DataType.UUID,
        field: 'quote_id',
        allowNull: false,
    })
    quoteId!: string;

    @BelongsTo(() => Quote)
    quote!: Quote;

    @ForeignKey(() => Product)
    @Column({
        type: DataType.UUID,
        field: 'product_id',
        allowNull: true,
    })
    productId?: string;

    @BelongsTo(() => Product)
    product?: Product;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    description!: string;

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