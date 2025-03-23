// src/infrastructure/database/models/favorite.model.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import User from './user.model';
import Product from './product.model';

@Table({
    tableName: 'favorites',
    timestamps: true,
    underscored: true,
})
export default class Favorite extends Model {
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

    @ForeignKey(() => Product)
    @Column({
        type: DataType.UUID,
        field: 'product_id',
        allowNull: false,
    })
    productId!: string;

    @BelongsTo(() => Product)
    product!: Product;
}