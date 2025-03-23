// src/infrastructure/database/models/product-image.model.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import Product from './product.model';

@Table({
    tableName: 'product_images',
    timestamps: true,
    underscored: true,
})
export default class ProductImage extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id!: string;

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
        allowNull: false,
    })
    url!: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
    })
    order!: number;
}