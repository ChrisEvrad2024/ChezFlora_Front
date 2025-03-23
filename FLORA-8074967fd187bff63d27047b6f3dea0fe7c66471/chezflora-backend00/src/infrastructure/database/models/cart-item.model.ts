// src/infrastructure/database/models/cart-item.model.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import Cart from './cart.model';
import Product from './product.model';

@Table({
    tableName: 'cart_items',
    timestamps: true,
    underscored: true,
})
export default class CartItem extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id!: string;

    @ForeignKey(() => Cart)
    @Column({
        type: DataType.UUID,
        field: 'cart_id',
        allowNull: false,
    })
    cartId!: string;

    @BelongsTo(() => Cart)
    cart!: Cart;

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
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 1
        }
    })
    quantity!: number;

    @Column({
        type: DataType.DECIMAL(10, 2),
        field: 'unit_price',
        allowNull: false,
    })
    unitPrice!: number;
}