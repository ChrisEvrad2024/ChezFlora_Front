// src/infrastructure/database/models/address.model.ts
import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { AddressEntity } from '../../../domain/entities/address.entity';

@Table({
    tableName: 'addresses',
    timestamps: true,
})
export class Address extends Model implements AddressEntity {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id!: string;

    @Column({
        type: DataType.UUID,
        field: 'user_id',
        allowNull: false,
    })
    userId!: string;

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

    @Column({
        type: DataType.DATE,
        field: 'created_at',
        defaultValue: DataType.NOW,
    })
    createdAt!: Date;

    @Column({
        type: DataType.DATE,
        field: 'updated_at',
        defaultValue: DataType.NOW,
    })
    updatedAt!: Date;

    // Les associations seront définies dans index.ts
}