// src/infrastructure/database/models/cart.model.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import User from './user.model';
import CartItem from './cart-item.model';

@Table({
    tableName: 'carts',
    timestamps: true,
    underscored: true,
})
export default class Cart extends Model {
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
        unique: true
    })
    userId!: string;

    @BelongsTo(() => User)
    user!: User;

    @HasMany(() => CartItem)
    items!: CartItem[];
}