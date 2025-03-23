// src/infrastructure/database/models/address.model.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import User from './user.model';

@Table({
    tableName: 'addresses',
    timestamps: true,
    underscored: true,
})
export default class Address extends Model {
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
        type: DataType.STRING,
        field: 'first_name',
        allowNull: false,
    })
    firstName!: string;

    @Column({
        type: DataType.STRING,
        field: 'last_name',
        allowNull: false,
    })
    lastName!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    street!: string;

    @Column({
        type: DataType.STRING,
        field: 'zip_code',
        allowNull: false,
    })
    zipCode!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    city!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    country!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    phone?: string;

    @Column({
        type: DataType.BOOLEAN,
        field: 'is_default',
        defaultValue: false,
    })
    isDefault!: boolean;
}