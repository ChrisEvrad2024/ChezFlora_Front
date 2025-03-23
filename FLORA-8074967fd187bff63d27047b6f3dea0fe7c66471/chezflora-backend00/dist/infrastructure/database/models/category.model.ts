// src/infrastructure/database/models/category.model.ts
import { Table, Column, Model, DataType, HasMany, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import Product from './product.model';

@Table({
    tableName: 'categories',
    timestamps: true,
    underscored: true,
})
export default class Category extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    declare id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name!: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    description?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    image?: string;

    @ForeignKey(() => Category)
    @Column({
        type: DataType.UUID,
        field: 'parent_id',
        allowNull: true,
    })
    parentId!: string | null;

    @BelongsTo(() => Category)
    parentCategory!: Category;

    @HasMany(() => Category)
    childCategories!: Category[];

    @HasMany(() => Product)
    products!: Product[];
}